import { NextRequest, NextResponse } from 'next/server'
import { trackPageView, generateSessionId, getVisitorInfo } from './analytics'

/**
 * Analytics middleware to automatically track page views
 */
export async function analyticsMiddleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // Skip tracking for certain paths
  const skipPaths = [
    '/api/',
    '/_next/',
    '/favicon',
    '/admin/',
    '/robots.txt',
    '/sitemap.xml'
  ]
  
  const shouldSkip = skipPaths.some(path => pathname.startsWith(path)) ||
    pathname.includes('.') // Skip files with extensions
  
  if (shouldSkip) {
    return NextResponse.next()
  }
  
  // Track the page view asynchronously (don't block the response)
  trackPageViewAsync(request, pathname)
  
  return NextResponse.next()
}

/**
 * Asynchronously track page view without blocking the response
 */
async function trackPageViewAsync(request: NextRequest, pathname: string) {
  try {
    const visitorInfo = await getVisitorInfo()
    const sessionId = generateSessionId(visitorInfo.ipAddress, visitorInfo.userAgent)
    
    // Get referrer from headers
    const referrer = request.headers.get('referer') || undefined
    
    // Create page title from pathname
    const pageTitle = getPageTitle(pathname)
    
    await trackPageView({
      pageUrl: pathname,
      pageTitle,
      referrer,
      sessionId
    })
  } catch (error) {
    // Log error but don't throw to avoid breaking the request
    console.error('Analytics tracking failed:', error)
  }
}

/**
 * Generate page title from pathname
 */
function getPageTitle(pathname: string): string {
  const pathMap: Record<string, string> = {
    '/': 'Home',
    '/projects': 'Projects',
    '/about': 'About',
    '/contact': 'Contact',
    '/resume': 'Resume'
  }
  
  // Check for exact matches first
  if (pathMap[pathname]) {
    return pathMap[pathname]
  }
  
  // Handle dynamic routes
  if (pathname.startsWith('/projects/')) {
    return 'Project Details'
  }
  
  // Default title generation
  return pathname
    .split('/')
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ') || 'Home'
}

/**
 * Rate limiting for analytics tracking
 */
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100

export function isRateLimited(ipAddress: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  
  // Clean up old entries
  for (const [ip, timestamp] of rateLimitMap.entries()) {
    if (timestamp < windowStart) {
      rateLimitMap.delete(ip)
    }
  }
  
  // Count requests from this IP in the current window
  let requestCount = 0
  for (const [ip, timestamp] of rateLimitMap.entries()) {
    if (ip === ipAddress && timestamp >= windowStart) {
      requestCount++
    }
  }
  
  if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }
  
  // Add current request
  rateLimitMap.set(`${ipAddress}-${now}`, now)
  return false
}