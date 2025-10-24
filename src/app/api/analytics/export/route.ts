import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsDataWithFilters, getAnalyticsSummary, getPopularPages, getVisitorFlow } from '@/lib/analytics'
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
    const format = searchParams.get('format') || 'csv'
    
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
      const maxRange = 2 * 365 * 24 * 60 * 60 * 1000
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
      if (!Number.isInteger(days) || days < 1 || days > 730) {
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
    
    // Fetch comprehensive analytics data
    const [analyticsData, summaryData, popularPages, visitorFlow] = await Promise.all([
      getAnalyticsDataWithFilters(startDate, endDate, filters),
      getAnalyticsSummary(startDate, endDate),
      getPopularPages(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))),
      getVisitorFlow(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    ])
    
    if (format === 'json') {
      // Return comprehensive JSON export
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          dateRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          filters,
          totalRecords: analyticsData.totalViews
        },
        summary: summaryData,
        analytics: analyticsData,
        popularPages,
        visitorFlow,
        performanceMetrics: analyticsData.performanceMetrics
      }
      
      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="analytics-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.json"`
        }
      })
    }
    
    // Enhanced CSV format with comprehensive data
    const csvRows = []
    
    // Metadata section
    csvRows.push('Analytics Export Report')
    csvRows.push(`Export Date,${new Date().toISOString()}`)
    csvRows.push(`Date Range,${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`)
    csvRows.push(`Applied Filters,"${Object.entries(filters).filter(([_, v]) => v).map(([k, v]) => `${k}:${v}`).join(', ')}"`)
    csvRows.push('')
    
    // Summary metrics
    csvRows.push('Summary Metrics')
    csvRows.push('Metric,Value')
    csvRows.push(`Total Page Views,${analyticsData.totalViews}`)
    csvRows.push(`Unique Visitors,${analyticsData.uniqueVisitors}`)
    csvRows.push(`Average Pages per Session,${summaryData.avgPagesPerSession.toFixed(2)}`)
    csvRows.push(`Bounce Rate,${summaryData.bounceRate}%`)
    csvRows.push('')
    
    // Daily views data
    csvRows.push('Daily Page Views')
    csvRows.push('Date,Views')
    analyticsData.dailyViews.forEach(day => {
      csvRows.push(`${day.date},${day.views}`)
    })
    csvRows.push('')
    
    // Top pages with engagement metrics
    csvRows.push('Popular Pages (with Engagement)')
    csvRows.push('Page URL,Views,Unique Visitors,Avg Time on Page (seconds)')
    popularPages.forEach(page => {
      csvRows.push(`"${page.url}",${page.views},${page.uniqueVisitors},${page.avgTimeOnPage}`)
    })
    csvRows.push('')
    
    // Geographic distribution
    csvRows.push('Top Countries')
    csvRows.push('Country,Visitors')
    summaryData.topCountries.forEach(country => {
      csvRows.push(`"${country.country}",${country.count}`)
    })
    csvRows.push('')
    
    // Traffic sources
    csvRows.push('Top Referrers')
    csvRows.push('Referrer,Count')
    summaryData.topReferrers.forEach(referrer => {
      csvRows.push(`"${referrer.referrer}",${referrer.count}`)
    })
    csvRows.push('')
    
    // Device breakdown
    csvRows.push('Device Breakdown')
    csvRows.push('Device,Count,Percentage')
    const totalDevices = analyticsData.deviceStats.reduce((sum, device) => sum + device.count, 0)
    analyticsData.deviceStats.forEach(device => {
      const percentage = totalDevices > 0 ? ((device.count / totalDevices) * 100).toFixed(1) : '0'
      csvRows.push(`"${device.device}",${device.count},${percentage}%`)
    })
    csvRows.push('')
    
    // Browser breakdown
    csvRows.push('Browser Breakdown')
    csvRows.push('Browser,Count,Percentage')
    const totalBrowsers = analyticsData.browserStats.reduce((sum, browser) => sum + browser.count, 0)
    analyticsData.browserStats.forEach(browser => {
      const percentage = totalBrowsers > 0 ? ((browser.count / totalBrowsers) * 100).toFixed(1) : '0'
      csvRows.push(`"${browser.browser}",${browser.count},${percentage}%`)
    })
    csvRows.push('')
    
    // Visitor flow
    csvRows.push('Visitor Flow (Top Transitions)')
    csvRows.push('From Page,To Page,Transitions')
    visitorFlow.slice(0, 20).forEach(flow => {
      csvRows.push(`"${flow.fromPage}","${flow.toPage}",${flow.transitions}`)
    })
    csvRows.push('')
    
    // Performance metrics
    if (analyticsData.performanceMetrics) {
      csvRows.push('Performance Metrics')
      csvRows.push('Metric,Value')
      csvRows.push(`Total Records,${analyticsData.performanceMetrics.totalRecords}`)
      csvRows.push(`Query Response Time (ms),${analyticsData.performanceMetrics.avgResponseTime}`)
      csvRows.push(`Peak Hour,${analyticsData.performanceMetrics.peakHour.hour}:00`)
      csvRows.push(`Peak Hour Traffic,${analyticsData.performanceMetrics.peakHour.count}`)
      csvRows.push(`Estimated Data Size (KB),${analyticsData.performanceMetrics.estimatedDataSizeKB}`)
      csvRows.push('')
    }
    
    const csvContent = csvRows.join('\n')
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv"`
      }
    })
    
  } catch (error) {
    console.error('Analytics export error:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    )
  }
}