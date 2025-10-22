import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsData, getAnalyticsDataWithFilters } from '@/lib/analytics'
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
    
    // Handle date range parameters
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const daysParam = searchParams.get('days')
    
    let startDate: Date
    let endDate: Date
    
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam)
      endDate = new Date(endDateParam)
      
      // Validate date range
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        )
      }
      
      if (startDate > endDate) {
        return NextResponse.json(
          { error: 'Start date must be before end date' },
          { status: 400 }
        )
      }
      
      // Limit to 2 years max
      const maxRange = 2 * 365 * 24 * 60 * 60 * 1000 // 2 years in milliseconds
      if (endDate.getTime() - startDate.getTime() > maxRange) {
        return NextResponse.json(
          { error: 'Date range cannot exceed 2 years' },
          { status: 400 }
        )
      }
    } else {
      const parsed = Number(daysParam ?? '30')
      const days = Number.isFinite(parsed) && Number.isInteger(parsed) ? parsed : NaN
      
      // Validate days parameter
      if (!Number.isInteger(days) || days < 1 || days > 730) { // Max 2 years
        return NextResponse.json(
          { error: 'Days parameter must be between 1 and 730' },
          { status: 400 }
        )
      }
      
      endDate = new Date()
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    }
    
    // Get filter parameters
    const filters = {
      country: searchParams.get('country') || undefined,
      device: searchParams.get('device') || undefined,
      browser: searchParams.get('browser') || undefined,
      page: searchParams.get('page') || undefined
    }
    
    const analyticsData = await getAnalyticsDataWithFilters(startDate, endDate, filters)
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    })
    
  } catch (error) {
    console.error('Analytics data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}