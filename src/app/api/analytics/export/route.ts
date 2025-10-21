import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsData } from '@/lib/analytics'
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
    
    const analyticsData = await getAnalyticsData(days)
    
    // Convert to CSV format
    const csvHeaders = [
      'Date',
      'Page Views',
      'Unique Visitors',
      'Top Page',
      'Top Page Views',
      'Top Device',
      'Top Browser'
    ]
    
    const csvRows = []
    csvRows.push(csvHeaders.join(','))
    
    // Add daily data
    analyticsData.dailyViews.forEach(day => {
      const topPage = analyticsData.topPages[0]
      const topDevice = analyticsData.deviceStats[0]
      const topBrowser = analyticsData.browserStats[0]
      
      const row = [
        day.date,
        day.views,
        '', // We don't have daily unique visitors in this format
        topPage?.url || '',
        topPage?.views || '',
        topDevice?.device || '',
        topBrowser?.browser || ''
      ]
      csvRows.push(row.join(','))
    })
    
    // Add summary row
    csvRows.push('')
    csvRows.push('Summary')
    csvRows.push(`Total Views,${analyticsData.totalViews}`)
    csvRows.push(`Unique Visitors,${analyticsData.uniqueVisitors}`)
    csvRows.push(`Total Pages,${analyticsData.topPages.length}`)
    
    // Add top pages
    csvRows.push('')
    csvRows.push('Top Pages')
    csvRows.push('Page,Views')
    analyticsData.topPages.forEach(page => {
      csvRows.push(`"${page.url}",${page.views}`)
    })
    
    // Add device breakdown
    csvRows.push('')
    csvRows.push('Device Breakdown')
    csvRows.push('Device,Count')
    analyticsData.deviceStats.forEach(device => {
      csvRows.push(`"${device.device}",${device.count}`)
    })
    
    // Add browser breakdown
    csvRows.push('')
    csvRows.push('Browser Breakdown')
    csvRows.push('Browser,Count')
    analyticsData.browserStats.forEach(browser => {
      csvRows.push(`"${browser.browser}",${browser.count}`)
    })
    
    const csvContent = csvRows.join('\n')
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${days}days-${new Date().toISOString().split('T')[0]}.csv"`
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