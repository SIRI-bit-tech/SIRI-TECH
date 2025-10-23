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
      name,
      value,
      id,
      label,
      delta,
      navigationType,
      rating,
      url,
      pathname,
      timestamp,
      userAgent,
    } = body

    // Validate required fields
    if (!name || value === undefined || !id || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const clientIP = getClientIP(request)

    // Store web vitals data in analytics table (WebVital model may need client regeneration)
    await prisma.analytics.create({
      data: {
        pageUrl: url,
        pageTitle: `Web Vital: ${name} - ${value}${rating ? ` (${rating})` : ''}`,
        userAgent: userAgent || request.headers.get('user-agent') || null,
        ipAddress: clientIP,
        sessionId: `wv-${id}`,
        timestamp: new Date(timestamp),
      }
    })

    // Also create an analytics entry for tracking
    await prisma.analytics.create({
      data: {
        pageUrl: pathname || url,
        pageTitle: `Web Vital: ${name}`,
        userAgent: userAgent || request.headers.get('user-agent') || null,
        ipAddress: clientIP,
        sessionId: `wv-${id}`,
        timestamp: new Date(timestamp),
      }
    }).catch(() => {
      // Silent fail for analytics entry
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing web vitals:', error)
    return NextResponse.json(
      { error: 'Failed to store web vitals' },
      { status: 500 }
    )
  }
}