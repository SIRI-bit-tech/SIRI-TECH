import { NextRequest, NextResponse } from 'next/server'
import { cleanupOldAnalytics } from '@/lib/analytics'
import { auth } from '@/lib/auth'

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
    const {
      enabled = true,
      retentionDays = 365,
      schedule = 'weekly', // daily, weekly, monthly
      aggressive = false
    } = body
    
    // Validate parameters
    if (retentionDays < 30 || retentionDays > 1095) {
      return NextResponse.json(
        { error: 'Retention days must be between 30 and 1095' },
        { status: 400 }
      )
    }
    
    if (!['daily', 'weekly', 'monthly'].includes(schedule)) {
      return NextResponse.json(
        { error: 'Schedule must be daily, weekly, or monthly' },
        { status: 400 }
      )
    }
    
    // In a production environment, this would integrate with a job scheduler
    // For now, we'll simulate the scheduling configuration
    const scheduledCleanup = {
      id: `cleanup-${Date.now()}`,
      enabled,
      retentionDays,
      schedule,
      aggressive,
      nextRun: getNextRunDate(schedule),
      createdAt: new Date().toISOString(),
      lastRun: null
    }
    
    // Store the schedule configuration (in production, this would be in a database)
    // For demo purposes, we'll just return the configuration
    
    return NextResponse.json({
      success: true,
      data: scheduledCleanup,
      message: `Scheduled cleanup configured: ${schedule} cleanup of data older than ${retentionDays} days`
    })
    
  } catch (error) {
    console.error('Schedule cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule cleanup' },
      { status: 500 }
    )
  }
}

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
    
    // In production, this would fetch from database
    const mockSchedules = [
      {
        id: 'cleanup-weekly',
        enabled: true,
        retentionDays: 365,
        schedule: 'weekly',
        aggressive: false,
        nextRun: getNextRunDate('weekly'),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    
    return NextResponse.json({
      success: true,
      data: mockSchedules
    })
    
  } catch (error) {
    console.error('Get scheduled cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to get scheduled cleanup' },
      { status: 500 }
    )
  }
}

// Simulate running scheduled cleanup (would be triggered by cron job in production)
export async function PUT(request: NextRequest) {
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
    const scheduleId = searchParams.get('id')
    
    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }
    
    // In production, fetch the actual schedule from database
    const mockSchedule = {
      id: scheduleId,
      enabled: true,
      retentionDays: 365,
      schedule: 'weekly',
      aggressive: false
    }
    
    if (!mockSchedule.enabled) {
      return NextResponse.json(
        { error: 'Scheduled cleanup is disabled' },
        { status: 400 }
      )
    }
    
    // Run the cleanup
    const result = await cleanupOldAnalytics(mockSchedule.retentionDays)
    
    // Update last run time (in production, update database)
    const updatedSchedule = {
      ...mockSchedule,
      lastRun: new Date().toISOString(),
      nextRun: getNextRunDate(mockSchedule.schedule)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        schedule: updatedSchedule,
        cleanupResult: result
      },
      message: `Scheduled cleanup executed successfully`
    })
    
  } catch (error) {
    console.error('Execute scheduled cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to execute scheduled cleanup' },
      { status: 500 }
    )
  }
}

function getNextRunDate(schedule: string): string {
  const now = new Date()
  
  switch (schedule) {
    case 'daily':
      now.setDate(now.getDate() + 1)
      break
    case 'weekly':
      now.setDate(now.getDate() + 7)
      break
    case 'monthly':
      now.setMonth(now.getMonth() + 1)
      break
    default:
      now.setDate(now.getDate() + 7) // Default to weekly
  }
  
  return now.toISOString()
}