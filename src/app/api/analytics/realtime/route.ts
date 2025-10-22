import { NextRequest, NextResponse } from 'next/server'
import { getRealTimeAnalytics } from '@/lib/analytics'
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
    
    const realTimeData = await getRealTimeAnalytics()
    
    return NextResponse.json({
      success: true,
      data: realTimeData
    })
    
  } catch (error) {
    console.error('Real-time analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch real-time analytics' },
      { status: 500 }
    )
  }
}