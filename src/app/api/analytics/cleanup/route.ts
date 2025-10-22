import { NextRequest, NextResponse } from 'next/server'
import { cleanupOldAnalytics, getPerformanceMetrics } from '@/lib/analytics'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication for admin routes
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    let { retentionDays = 365, dryRun = false, aggressive = false, compactData = false } = body ?? {}
    retentionDays = Number(retentionDays)
    if (!Number.isInteger(retentionDays)) {
      return NextResponse.json({ error: 'retentionDays must be an integer' }, { status: 400 })
    }
    dryRun = Boolean(dryRun)
    aggressive = Boolean(aggressive)
    compactData = Boolean(compactData)

    // Validate retention days
    if (retentionDays < 30 || retentionDays > 1095) { // Min 30 days, max 3 years
      return NextResponse.json(
        { error: 'Retention days must be between 30 and 1095' },
        { status: 400 }
      )
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    // Get current database size before cleanup
    const beforeMetrics = await getDataSizeMetrics()

    let result: any
    if (dryRun) {
      // Simulate cleanup without actually deleting
      result = await simulateCleanup(cutoffDate, aggressive)
    } else {
      // Perform actual cleanup
      result = await cleanupOldAnalytics(retentionDays)

      // If aggressive cleanup is enabled, also remove duplicate entries
      if (aggressive) {
        const duplicateCleanup = await removeDuplicateEntries()
        result.duplicatesRemoved = duplicateCleanup.count
      }

      // If data compaction is enabled, optimize database
      if (compactData) {
        await compactAnalyticsData()
        result.dataCompacted = true
      }
    }

    // Get database size after cleanup
    const afterMetrics = await getDataSizeMetrics()
    const spaceSaved = beforeMetrics.totalSize - afterMetrics.totalSize

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        dryRun,
        retentionPolicy: {
          retentionDays,
          cutoffDate: cutoffDate.toISOString(),
          aggressive,
          compactData
        },
        performance: {
          beforeSize: beforeMetrics,
          afterSize: afterMetrics,
          spaceSavedKB: Math.max(0, spaceSaved),
          spaceSavedPercentage: beforeMetrics.totalSize > 0
            ? Math.max(0, (spaceSaved / beforeMetrics.totalSize) * 100).toFixed(2)
            : '0'
        }
      },
      message: dryRun
        ? `Dry run: Would clean up analytics data older than ${retentionDays} days`
        : `Cleaned up analytics data older than ${retentionDays} days`
    })

  } catch (error) {
    console.error('Analytics cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup analytics data' },
      { status: 500 }
    )
  }
}

// GET endpoint to check cleanup status and recommendations
export async function GET(request: NextRequest) {
  try {
    // Check authentication for admin routes
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const metrics = await getDataSizeMetrics()
    const recommendations = await getCleanupRecommendations()

    return NextResponse.json({
      success: true,
      data: {
        currentSize: metrics,
        recommendations,
        lastCleanup: await getLastCleanupDate(),
        retentionPolicies: {
          recommended: 365,
          minimum: 30,
          maximum: 1095
        }
      }
    })

  } catch (error) {
    console.error('Analytics cleanup status error:', error)
    return NextResponse.json(
      { error: 'Failed to get cleanup status' },
      { status: 500 }
    )
  }
}

// Helper functions
async function getDataSizeMetrics() {
  try {
    const [analyticsCount, pageViewsCount, sessionsCount] = await Promise.all([
      prisma.analytics.count(),
      prisma.pageView.count(),
      prisma.session.count()
    ])

    // Rough size estimation (in KB)
    const analyticsSize = analyticsCount * 0.5 // ~500 bytes per record
    const pageViewsSize = pageViewsCount * 0.2 // ~200 bytes per record
    const sessionsSize = sessionsCount * 0.3 // ~300 bytes per record

    return {
      analytics: { count: analyticsCount, sizeKB: Math.round(analyticsSize) },
      pageViews: { count: pageViewsCount, sizeKB: Math.round(pageViewsSize) },
      sessions: { count: sessionsCount, sizeKB: Math.round(sessionsSize) },
      totalSize: Math.round(analyticsSize + pageViewsSize + sessionsSize)
    }
  } catch (error) {
    console.error('Failed to get data size metrics:', error)
    return {
      analytics: { count: 0, sizeKB: 0 },
      pageViews: { count: 0, sizeKB: 0 },
      sessions: { count: 0, sizeKB: 0 },
      totalSize: 0
    }
  }
}

async function simulateCleanup(cutoffDate: Date, aggressive: boolean) {
  try {
    const [analyticsCount, pageViewsCount, sessionsCount] = await Promise.all([
      prisma.analytics.count({
        where: { timestamp: { lt: cutoffDate } }
      }),
      prisma.pageView.count({
        where: { timestamp: { lt: cutoffDate } }
      }),
      prisma.session.count({
        where: { startTime: { lt: cutoffDate } }
      })
    ])

    let duplicatesCount = 0
    if (aggressive) {
      // Simulate duplicate detection
      duplicatesCount = Math.floor(analyticsCount * 0.05) // Assume 5% duplicates
    }

    return {
      deletedAnalytics: analyticsCount,
      deletedPageViews: pageViewsCount,
      deletedSessions: sessionsCount,
      duplicatesRemoved: duplicatesCount,
      simulation: true
    }
  } catch (error) {
    console.error('Failed to simulate cleanup:', error)
    return {
      deletedAnalytics: 0,
      deletedPageViews: 0,
      deletedSessions: 0,
      duplicatesRemoved: 0,
      simulation: true
    }
  }
}

async function removeDuplicateEntries() {
  try {
    // Remove duplicate analytics entries (same session, page, and timestamp within 1 minute)
    const result = await prisma.$executeRaw`
      DELETE FROM analytics a1 USING analytics a2 
      WHERE a1.id > a2.id 
        AND a1.session_id = a2.session_id 
        AND a1.page_url = a2.page_url 
        AND ABS(EXTRACT(EPOCH FROM (a1.timestamp - a2.timestamp))) < 60
    `

    return { count: result }
  } catch (error) {
    console.error('Failed to remove duplicates:', error)
    return { count: 0 }
  }
}

async function compactAnalyticsData() {
  try {
    // In PostgreSQL, we can use VACUUM to reclaim space
    // Note: This requires appropriate permissions
    await prisma.$executeRaw`VACUUM ANALYZE analytics, page_views, sessions`
    return true
  } catch (error) {
    console.warn('Failed to compact data (may require elevated permissions):', error)
    return false
  }
}

async function getCleanupRecommendations() {
  try {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

    const [oldDataCount, veryOldDataCount, totalCount] = await Promise.all([
      prisma.analytics.count({
        where: { timestamp: { lt: oneYearAgo } }
      }),
      prisma.analytics.count({
        where: { timestamp: { lt: twoYearsAgo } }
      }),
      prisma.analytics.count()
    ])

    const recommendations = []

    if (veryOldDataCount > 0) {
      recommendations.push({
        type: 'urgent',
        message: `${veryOldDataCount} records are older than 2 years and should be cleaned up`,
        action: 'cleanup',
        retentionDays: 730
      })
    }

    if (oldDataCount > 1000) {
      recommendations.push({
        type: 'warning',
        message: `${oldDataCount} records are older than 1 year. Consider cleanup for better performance`,
        action: 'cleanup',
        retentionDays: 365
      })
    }

    if (totalCount > 100000) {
      recommendations.push({
        type: 'info',
        message: 'Large dataset detected. Consider enabling aggressive cleanup and data compaction',
        action: 'optimize',
        options: ['aggressive', 'compactData']
      })
    }

    return recommendations
  } catch (error) {
    console.error('Failed to get cleanup recommendations:', error)
    return []
  }
}

async function getLastCleanupDate() {
  try {
    // This would typically be stored in a separate cleanup log table
    // For now, we'll estimate based on the oldest record
    const oldestRecord = await prisma.analytics.findFirst({
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true }
    })

    return oldestRecord?.timestamp?.toISOString() || null
  } catch (error) {
    console.error('Failed to get last cleanup date:', error)
    return null
  }
}