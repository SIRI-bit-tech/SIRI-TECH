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
      type,
      duration,
      startTime,
      url,
      timestamp,
    } = body

    // Validate required fields
    if (!type || !url || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const clientIP = getClientIP(request)

    // Store performance data (you might want to create a separate table for this)
    await prisma.analytics.create({
      data: {
        pageUrl: url,
        pageTitle: `Performance: ${type}${duration ? ` (${Math.round(duration)}ms)` : ''}`,
        userAgent: request.headers.get('user-agent') || null,
        ipAddress: clientIP,
        sessionId: `perf-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date(timestamp),
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing performance data:', error)
    return NextResponse.json(
      { error: 'Failed to store performance data' },
      { status: 500 }
    )
  }
}