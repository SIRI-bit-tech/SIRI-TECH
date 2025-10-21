import { NextRequest, NextResponse } from 'next/server'
import { getVisitorFlow } from '@/lib/analytics'
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
    const days = parseInt(searchParams.get('days') || '30')
    
    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days parameter must be between 1 and 365' },
        { status: 400 }
      )
    }
    
    const visitorFlow = await getVisitorFlow(days)
    
    return NextResponse.json({
      success: true,
      data: visitorFlow,
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Visitor flow error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visitor flow' },
      { status: 500 }
    )
  }
}