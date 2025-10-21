import { NextRequest, NextResponse } from 'next/server'
import { getHourlyAnalytics } from '@/lib/analytics'
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
    const hours = parseInt(searchParams.get('hours') || '24')
    
    // Validate hours parameter
    if (hours < 1 || hours > 168) { // Max 1 week
      return NextResponse.json(
        { error: 'Hours parameter must be between 1 and 168' },
        { status: 400 }
      )
    }
    
    const hourlyData = await getHourlyAnalytics(hours)
    
    return NextResponse.json({
      success: true,
      data: hourlyData,
      period: {
        hours,
        startTime: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Hourly analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hourly analytics' },
      { status: 500 }
    )
  }
}