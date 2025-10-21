import { headers } from 'next/headers'
import { prisma } from './prisma'
import { UAParser } from 'ua-parser-js'

export interface AnalyticsEvent {
  pageUrl: string
  pageTitle?: string
  referrer?: string
  sessionId: string
}

export interface VisitorInfo {
  userAgent: string
  ipAddress: string
  country?: string
  city?: string
  device: string
  browser: string
}

/**
 * Generate a unique session ID based on IP and User Agent
 */
export function generateSessionId(ipAddress: string, userAgent: string): string {
  const hash = Buffer.from(`${ipAddress}-${userAgent}-${Date.now()}`).toString('base64')
  return hash.substring(0, 32)
}

/**
 * Parse user agent to extract device and browser information
 */
export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()
  
  return {
    device: result.device.type || 'desktop',
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim()
  }
}

/**
 * Get visitor information from request headers
 */
export async function getVisitorInfo(): Promise<VisitorInfo> {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  
  // Get IP address (handle proxy headers)
  let ipAddress = '127.0.0.1'
  if (forwarded) {
    ipAddress = forwarded.split(',')[0].trim()
  } else if (realIp) {
    ipAddress = realIp
  }
  
  const { device, browser } = parseUserAgent(userAgent)
  
  // Get geographic location
  let country: string | undefined
  let city: string | undefined
  
  try {
    if (ipAddress !== '127.0.0.1' && ipAddress !== '::1' && !ipAddress.startsWith('192.168.')) {
      // Use ip-api.com for geographic location (free tier: 1000 requests/month)
      const geoResponse = await fetch(
        `http://ip-api.com/json/${ipAddress}?fields=status,country,city,timezone`,
        { 
          headers: { 'User-Agent': 'Portfolio-Analytics/1.0' },
          signal: AbortSignal.timeout(3000) // 3 second timeout
        }
      )
      
      if (geoResponse.ok) {
        const geoData = await geoResponse.json()
        if (geoData.status === 'success') {
          country = geoData.country
          city = geoData.city
        }
      }
    }
  } catch (error) {
    console.warn('Failed to get geographic location:', error)
  }
  
  return {
    userAgent,
    ipAddress,
    country,
    city,
    device,
    browser
  }
}

/**
 * Track a page view and update session
 */
export async function trackPageView(event: AnalyticsEvent): Promise<void> {
  try {
    const visitorInfo = await getVisitorInfo()
    
    // Create or update session
    await prisma.session.upsert({
      where: { sessionId: event.sessionId },
      update: {
        endTime: new Date(),
        pageViews: { increment: 1 }
      },
      create: {
        sessionId: event.sessionId,
        userAgent: visitorInfo.userAgent,
        ipAddress: visitorInfo.ipAddress,
        country: visitorInfo.country,
        city: visitorInfo.city,
        device: visitorInfo.device,
        browser: visitorInfo.browser,
        pageViews: 1
      }
    })
    
    // Create analytics record
    await prisma.analytics.create({
      data: {
        pageUrl: event.pageUrl,
        pageTitle: event.pageTitle,
        referrer: event.referrer,
        userAgent: visitorInfo.userAgent,
        ipAddress: visitorInfo.ipAddress,
        country: visitorInfo.country,
        city: visitorInfo.city,
        device: visitorInfo.device,
        browser: visitorInfo.browser,
        sessionId: event.sessionId
      }
    })
    
    // Create page view record
    await prisma.pageView.create({
      data: {
        pageUrl: event.pageUrl,
        sessionId: event.sessionId
      }
    })
    
  } catch (error) {
    console.error('Failed to track page view:', error)
  }
}

/**
 * Get analytics data for dashboard
 */
export async function getAnalyticsData(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  try {
    // Get total page views
    const totalViews = await prisma.pageView.count({
      where: {
        timestamp: { gte: startDate }
      }
    })
    
    // Get unique visitors (sessions)
    const uniqueVisitors = await prisma.session.count({
      where: {
        startTime: { gte: startDate }
      }
    })
    
    // Get top pages
    const topPages = await prisma.pageView.groupBy({
      by: ['pageUrl'],
      _count: { pageUrl: true },
      where: {
        timestamp: { gte: startDate }
      },
      orderBy: {
        _count: { pageUrl: 'desc' }
      },
      take: 10
    })
    
    // Get recent visitors
    const recentVisitors = await prisma.analytics.findMany({
      where: {
        timestamp: { gte: startDate }
      },
      select: {
        country: true,
        city: true,
        timestamp: true,
        pageUrl: true
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    })
    
    // Get device statistics
    const deviceStats = await prisma.session.groupBy({
      by: ['device'],
      _count: { device: true },
      where: {
        startTime: { gte: startDate }
      },
      orderBy: {
        _count: { device: 'desc' }
      }
    })
    
    // Get browser statistics
    const browserStats = await prisma.session.groupBy({
      by: ['browser'],
      _count: { browser: true },
      where: {
        startTime: { gte: startDate }
      },
      orderBy: {
        _count: { browser: 'desc' }
      }
    })
    
    // Get daily views for the chart
    const dailyViews = await prisma.$queryRaw<Array<{ date: string; views: number }>>`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as views
      FROM page_views 
      WHERE timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `
    
    return {
      totalViews,
      uniqueVisitors,
      topPages: topPages.map(page => ({
        url: page.pageUrl,
        views: page._count.pageUrl
      })),
      recentVisitors,
      deviceStats: deviceStats.map(stat => ({
        device: stat.device || 'Unknown',
        count: stat._count.device
      })),
      browserStats: browserStats.map(stat => ({
        browser: stat.browser || 'Unknown',
        count: stat._count.browser
      })),
      dailyViews: dailyViews.map(day => ({
        date: day.date,
        views: Number(day.views)
      }))
    }
  } catch (error) {
    console.error('Failed to get analytics data:', error)
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      topPages: [],
      recentVisitors: [],
      deviceStats: [],
      browserStats: [],
      dailyViews: []
    }
  }
}

/**
 * Get real-time analytics data (last 24 hours)
 */
export async function getRealTimeAnalytics() {
  const last24Hours = new Date()
  last24Hours.setHours(last24Hours.getHours() - 24)
  
  try {
    // Active sessions (sessions with activity in last 30 minutes)
    const last30Minutes = new Date()
    last30Minutes.setMinutes(last30Minutes.getMinutes() - 30)
    
    const activeSessions = await prisma.session.count({
      where: {
        endTime: { gte: last30Minutes }
      }
    })
    
    // Page views in last 24 hours
    const recentViews = await prisma.pageView.count({
      where: {
        timestamp: { gte: last24Hours }
      }
    })
    
    // Recent page views with details
    const recentActivity = await prisma.analytics.findMany({
      where: {
        timestamp: { gte: last24Hours }
      },
      select: {
        pageUrl: true,
        pageTitle: true,
        country: true,
        city: true,
        device: true,
        browser: true,
        timestamp: true
      },
      orderBy: { timestamp: 'desc' },
      take: 20
    })
    
    return {
      activeSessions,
      recentViews,
      recentActivity
    }
  } catch (error) {
    console.error('Failed to get real-time analytics:', error)
    return {
      activeSessions: 0,
      recentViews: 0,
      recentActivity: []
    }
  }
}
/**
 * 
Get analytics summary for a specific time period
 */
export async function getAnalyticsSummary(startDate: Date, endDate: Date) {
  try {
    const [
      totalViews,
      uniqueVisitors,
      avgSessionDuration,
      bounceRate,
      topCountries,
      topReferrers
    ] = await Promise.all([
      // Total page views
      prisma.pageView.count({
        where: {
          timestamp: { gte: startDate, lte: endDate }
        }
      }),
      
      // Unique visitors (sessions)
      prisma.session.count({
        where: {
          startTime: { gte: startDate, lte: endDate }
        }
      }),
      
      // Average session duration
      prisma.session.aggregate({
        where: {
          startTime: { gte: startDate, lte: endDate },
          endTime: { not: null }
        },
        _avg: {
          pageViews: true
        }
      }),
      
      // Bounce rate (sessions with only 1 page view)
      prisma.session.count({
        where: {
          startTime: { gte: startDate, lte: endDate },
          pageViews: 1
        }
      }),
      
      // Top countries
      prisma.session.groupBy({
        by: ['country'],
        _count: { country: true },
        where: {
          startTime: { gte: startDate, lte: endDate },
          country: { not: null }
        },
        orderBy: {
          _count: { country: 'desc' }
        },
        take: 10
      }),
      
      // Top referrers
      prisma.analytics.groupBy({
        by: ['referrer'],
        _count: { referrer: true },
        where: {
          timestamp: { gte: startDate, lte: endDate },
          referrer: { not: null }
        },
        orderBy: {
          _count: { referrer: 'desc' }
        },
        take: 10
      })
    ])
    
    const bounceRatePercentage = uniqueVisitors > 0 ? (bounceRate / uniqueVisitors) * 100 : 0
    
    return {
      totalViews,
      uniqueVisitors,
      avgPagesPerSession: avgSessionDuration._avg.pageViews || 0,
      bounceRate: Math.round(bounceRatePercentage * 100) / 100,
      topCountries: topCountries.map(item => ({
        country: item.country || 'Unknown',
        count: item._count.country
      })),
      topReferrers: topReferrers.map(item => ({
        referrer: item.referrer || 'Direct',
        count: item._count.referrer
      }))
    }
  } catch (error) {
    console.error('Failed to get analytics summary:', error)
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      avgPagesPerSession: 0,
      bounceRate: 0,
      topCountries: [],
      topReferrers: []
    }
  }
}

/**
 * Get hourly analytics data for real-time charts
 */
export async function getHourlyAnalytics(hours: number = 24) {
  const startDate = new Date()
  startDate.setHours(startDate.getHours() - hours)
  
  try {
    const hourlyData = await prisma.$queryRaw<Array<{ hour: string; views: number; visitors: number }>>`
      SELECT 
        DATE_TRUNC('hour', timestamp) as hour,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as visitors
      FROM page_views 
      WHERE timestamp >= ${startDate}
      GROUP BY DATE_TRUNC('hour', timestamp)
      ORDER BY hour ASC
    `
    
    return hourlyData.map(item => ({
      hour: item.hour,
      views: Number(item.views),
      visitors: Number(item.visitors)
    }))
  } catch (error) {
    console.error('Failed to get hourly analytics:', error)
    return []
  }
}

/**
 * Get popular pages with engagement metrics
 */
export async function getPopularPages(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  try {
    const popularPages = await prisma.$queryRaw<Array<{
      page_url: string;
      views: number;
      unique_visitors: number;
      avg_time_on_page: number;
    }>>`
      SELECT 
        pv.page_url,
        COUNT(*) as views,
        COUNT(DISTINCT pv.session_id) as unique_visitors,
        AVG(EXTRACT(EPOCH FROM (s.end_time - s.start_time))) as avg_time_on_page
      FROM page_views pv
      LEFT JOIN sessions s ON pv.session_id = s.session_id
      WHERE pv.timestamp >= ${startDate}
      GROUP BY pv.page_url
      ORDER BY views DESC
      LIMIT 20
    `
    
    return popularPages.map(page => ({
      url: page.page_url,
      views: Number(page.views),
      uniqueVisitors: Number(page.unique_visitors),
      avgTimeOnPage: Math.round(Number(page.avg_time_on_page) || 0)
    }))
  } catch (error) {
    console.error('Failed to get popular pages:', error)
    return []
  }
}

/**
 * Clean up old analytics data (for data retention)
 */
export async function cleanupOldAnalytics(retentionDays: number = 365) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
  
  try {
    const [deletedAnalytics, deletedPageViews, deletedSessions] = await Promise.all([
      prisma.analytics.deleteMany({
        where: {
          timestamp: { lt: cutoffDate }
        }
      }),
      prisma.pageView.deleteMany({
        where: {
          timestamp: { lt: cutoffDate }
        }
      }),
      prisma.session.deleteMany({
        where: {
          startTime: { lt: cutoffDate }
        }
      })
    ])
    
    return {
      deletedAnalytics: deletedAnalytics.count,
      deletedPageViews: deletedPageViews.count,
      deletedSessions: deletedSessions.count
    }
  } catch (error) {
    console.error('Failed to cleanup old analytics:', error)
    return {
      deletedAnalytics: 0,
      deletedPageViews: 0,
      deletedSessions: 0
    }
  }
}

/**
 * Get visitor flow data (page transitions)
 */
export async function getVisitorFlow(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  try {
    const flow = await prisma.$queryRaw<Array<{
      from_page: string;
      to_page: string;
      transitions: number;
    }>>`
      WITH page_sequences AS (
        SELECT 
          session_id,
          page_url,
          timestamp,
          LAG(page_url) OVER (PARTITION BY session_id ORDER BY timestamp) as prev_page
        FROM page_views
        WHERE timestamp >= ${startDate}
      )
      SELECT 
        prev_page as from_page,
        page_url as to_page,
        COUNT(*) as transitions
      FROM page_sequences
      WHERE prev_page IS NOT NULL
      GROUP BY prev_page, page_url
      ORDER BY transitions DESC
      LIMIT 50
    `
    
    return flow.map(item => ({
      fromPage: item.from_page,
      toPage: item.to_page,
      transitions: Number(item.transitions)
    }))
  } catch (error) {
    console.error('Failed to get visitor flow:', error)
    return []
  }
}