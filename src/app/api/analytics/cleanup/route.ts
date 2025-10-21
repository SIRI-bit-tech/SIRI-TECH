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
    const retentionDays = body.retentionDays || 365
    
    // Validate retention days
    if (retentionDays < 30 || retentionDays > 1095) { // Min 30 days, max 3 years
      return NextResponse.json(
        { error: 'Retention days must be between 30 and 1095' },
        { status: 400 }
      )
    }
    
    const result = await cleanupOldAnalytics(retentionDays)
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Cleaned up analytics data older than ${retentionDays} days`
    })
    
  } catch (error) {
    console.error('Analytics cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup analytics data' },
      { status: 500 }
    )
  }
}