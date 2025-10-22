import { NextRequest, NextResponse } from 'next/server'
import { getPerformanceMetrics } from '@/lib/analytics'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days parameter must be between 1 and 365' },
        { status: 400 }
      )
    }
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Get comprehensive performance metrics
    const [
      performanceMetrics,
      queryPerformance,
      indexUsage,
      slowQueries
    ] = await Promise.all([
      getPerformanceMetrics(startDate, endDate),
      getQueryPerformanceMetrics(),
      getIndexUsageStats(),
      getSlowQueryAnalysis(days)
    ])
    
    // Get database optimization recommendations
    const optimizationRecommendations = await getOptimizationRecommendations(performanceMetrics)
    
    return NextResponse.json({
      success: true,
      data: {
        performanceMetrics,
        queryPerformance,
        indexUsage,
        slowQueries,
        optimizationRecommendations,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Performance metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    )
  }
}

// Helper functions for performance analysis
async function getQueryPerformanceMetrics() {
  try {
    const startTime = Date.now()
    
    // Test query performance with different operations
    const [
      simpleCount,
      complexAggregation,
      joinQuery
    ] = await Promise.all([
      // Simple count query
      measureQueryTime(() => prisma.analytics.count()),
      
      // Complex aggregation
      measureQueryTime(() => prisma.analytics.groupBy({
        by: ['device'],
        _count: { device: true },
        orderBy: { _count: { device: 'desc' } },
        take: 10
      })),
      
      // Join query
      measureQueryTime(() => prisma.analytics.findMany({
        take: 100,
        orderBy: { timestamp: 'desc' }
      }))
    ])
    
    return {
      simpleQuery: simpleCount,
      aggregationQuery: complexAggregation,
      joinQuery: joinQuery,
      overallResponseTime: Date.now() - startTime
    }
  } catch (error) {
    console.error('Failed to get query performance metrics:', error)
    return {
      simpleQuery: { result: null, duration: 0 },
      aggregationQuery: { result: null, duration: 0 },
      joinQuery: { result: null, duration: 0 },
      overallResponseTime: 0
    }
  }
}

async function measureQueryTime<T>(queryFn: () => Promise<T>): Promise<{ result: T | null; duration: number }> {
  const startTime = Date.now()
  try {
    const result = await queryFn()
    return {
      result,
      duration: Date.now() - startTime
    }
  } catch (error) {
    console.error('Query execution failed:', error)
    return {
      result: null,
      duration: Date.now() - startTime
    }
  }
}

async function getIndexUsageStats() {
  try {
    // PostgreSQL-specific query to check index usage
    const indexStats = await prisma.$queryRaw<Array<{
      table_name: string;
      index_name: string;
      index_scans: number;
      tuples_read: number;
      tuples_fetched: number;
    }>>`
      SELECT 
        schemaname as schema_name,
        tablename as table_name,
        indexname as index_name,
        idx_scan as index_scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public' 
        AND tablename IN ('analytics', 'page_views', 'sessions')
      ORDER BY idx_scan DESC
    `
    
    return indexStats.map(stat => ({
      tableName: stat.table_name,
      indexName: stat.index_name,
      scans: Number(stat.index_scans),
      tuplesRead: Number(stat.tuples_read),
      tuplesFetched: Number(stat.tuples_fetched),
      efficiency: stat.tuples_read > 0 ? (Number(stat.tuples_fetched) / Number(stat.tuples_read) * 100).toFixed(2) : '0'
    }))
  } catch (error) {
    console.warn('Index usage stats not available (may not be PostgreSQL or insufficient permissions):', error)
    return []
  }
}

async function getSlowQueryAnalysis(days: number) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Analyze query patterns that might be slow
    const [
      largePageQueries,
      heavyAggregations,
      unindexedQueries
    ] = await Promise.all([
      // Queries with large result sets
      prisma.analytics.findMany({
        where: { timestamp: { gte: startDate } },
        select: { pageUrl: true },
        take: 1000
      }).then(results => ({
        type: 'large_result_set',
        count: results.length,
        recommendation: results.length > 500 ? 'Consider pagination for large queries' : 'Result set size is acceptable'
      })),
      
      // Heavy aggregation analysis
      prisma.analytics.groupBy({
        by: ['country', 'device', 'browser'],
        _count: { id: true },
        where: { timestamp: { gte: startDate } }
      }).then(results => ({
        type: 'heavy_aggregation',
        count: results.length,
        recommendation: results.length > 1000 ? 'Consider pre-aggregating data for better performance' : 'Aggregation complexity is manageable'
      })),
      
      // Unindexed query patterns (simulated)
      Promise.resolve({
        type: 'unindexed_queries',
        count: 0, // This would be detected through query analysis
        recommendation: 'Ensure proper indexes on timestamp, session_id, and page_url columns'
      })
    ])
    
    return [largePageQueries, heavyAggregations, unindexedQueries]
  } catch (error) {
    console.error('Failed to analyze slow queries:', error)
    return []
  }
}

async function getOptimizationRecommendations(performanceMetrics: any) {
  const recommendations = []
  
  // Check response time
  if (performanceMetrics.avgResponseTime > 1000) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      issue: 'Slow query response time',
      recommendation: 'Consider adding database indexes, optimizing queries, or implementing caching',
      impact: 'High - affects user experience'
    })
  }
  
  // Check data size
  if (performanceMetrics.totalRecords > 100000) {
    recommendations.push({
      type: 'scalability',
      priority: 'medium',
      issue: 'Large dataset size',
      recommendation: 'Implement data archiving, partitioning, or cleanup policies',
      impact: 'Medium - may affect future performance'
    })
  }
  
  // Check peak hour performance
  if (performanceMetrics.peakHour.count > 1000) {
    recommendations.push({
      type: 'capacity',
      priority: 'medium',
      issue: 'High peak hour traffic',
      recommendation: 'Consider implementing caching or read replicas for peak hours',
      impact: 'Medium - may cause slowdowns during peak times'
    })
  }
  
  // General optimization recommendations
  recommendations.push({
    type: 'optimization',
    priority: 'low',
    issue: 'Continuous improvement',
    recommendation: 'Regularly monitor query performance and update indexes based on usage patterns',
    impact: 'Low - preventive maintenance'
  })
  
  return recommendations
}