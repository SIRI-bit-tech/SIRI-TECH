import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      message,
      stack,
      digest,
      url,
      userAgent,
      timestamp
    } = body

    // Validate required fields
    if (!message || !url || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const clientIP = getClientIP(request)

    // Store error data in analytics table with special prefix
    await prisma.analytics.create({
      data: {
        pageUrl: url,
        pageTitle: `Error: ${message.substring(0, 100)}`,
        userAgent: userAgent || request.headers.get('user-agent') || null,
        ipAddress: clientIP,
        sessionId: `error-${digest || Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date(timestamp),
      }
    })

    // In production, you might want to send this to an external error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, or similar service
      console.error('Client Error:', {
        message,
        stack,
        digest,
        url,
        userAgent,
        timestamp: new Date(timestamp).toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing error report:', error)
    return NextResponse.json(
      { error: 'Failed to store error report' },
      { status: 500 }
    )
  }
}