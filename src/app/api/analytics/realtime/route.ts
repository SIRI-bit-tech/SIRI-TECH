import { NextRequest, NextResponse } from 'next/server'
import { getRealTimeAnalytics, getHourlyAnalytics } from '@/lib/analytics'
import { auth } from '@/lib/auth'

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
    const includeHourly = searchParams.get('includeHourly') === 'true'
    const hours = parseInt(searchParams.get('hours') || '24')
    
    // Validate hours parameter
    if (hours < 1 || hours > 168) { // Max 1 week
      return NextResponse.json(
        { error: 'Hours parameter must be between 1 and 168' },
        { status: 400 }
      )
    }
    
    const [realTimeData, hourlyData] = await Promise.all([
      getRealTimeAnalytics(),
      includeHourly ? getHourlyAnalytics(hours) : Promise.resolve([])
    ])
    
    // Add performance indicators
    const performanceIndicators = {
      dataFreshness: new Date().toISOString(),
      responseTime: Date.now(),
      cacheStatus: 'live', // In production, this could indicate cache hit/miss
      updateFrequency: '30s' // Configurable update frequency
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...realTimeData,
        hourlyData: includeHourly ? hourlyData : undefined,
        performance: performanceIndicators,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Real-time analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch real-time analytics' },
      { status: 500 }
    )
  }
}