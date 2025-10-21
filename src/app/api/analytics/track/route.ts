import { NextRequest, NextResponse } from 'next/server'
import { trackPageView, generateSessionId, getVisitorInfo } from '@/lib/analytics'
import { isRateLimited } from '@/lib/analytics-middleware'
import { z } from 'zod'

const trackingSchema = z.object({
  pageUrl: z.string().min(1),
  pageTitle: z.string().optional(),
  referrer: z.string().optional(),
  sessionId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Get visitor information first for rate limiting
    const visitorInfo = await getVisitorInfo()
    
    // Check rate limiting
    if (isRateLimited(visitorInfo.ipAddress)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    const { pageUrl, pageTitle, referrer, sessionId: providedSessionId } = trackingSchema.parse(body)
    
    // Use provided session ID or generate new one
    const sessionId = providedSessionId || generateSessionId(visitorInfo.ipAddress, visitorInfo.userAgent)
    
    // Track the page view
    await trackPageView({
      pageUrl,
      pageTitle,
      referrer,
      sessionId
    })
    
    return NextResponse.json({ 
      success: true,
      sessionId 
    })
    
  } catch (error) {
    console.error('Analytics tracking error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid tracking data', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}