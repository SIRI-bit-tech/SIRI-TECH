import { NextRequest, NextResponse } from 'next/server'
import { generateSessionId, getVisitorInfo } from '@/lib/analytics'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const sessionSchema = z.object({
  sessionId: z.string().optional(),
  action: z.enum(['start', 'heartbeat', 'end']).default('heartbeat'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId: providedSessionId, action } = sessionSchema.parse(body)
    
    // Get visitor information
    const visitorInfo = await getVisitorInfo()
    
    // Use provided session ID or generate new one
    const sessionId = providedSessionId || generateSessionId(visitorInfo.ipAddress, visitorInfo.userAgent)
    
    switch (action) {
      case 'start':
        // Create new session
        await prisma.session.upsert({
          where: { sessionId },
          update: {
            endTime: new Date(),
          },
          create: {
            sessionId,
            userAgent: visitorInfo.userAgent,
            ipAddress: visitorInfo.ipAddress,
            country: visitorInfo.country,
            city: visitorInfo.city,
            device: visitorInfo.device,
            browser: visitorInfo.browser,
            pageViews: 0
          }
        })
        break
        
      case 'heartbeat':
        // Update session activity
        await prisma.session.upsert({
          where: { sessionId },
          update: {
            endTime: new Date(),
          },
          create: {
            sessionId,
            userAgent: visitorInfo.userAgent,
            ipAddress: visitorInfo.ipAddress,
            country: visitorInfo.country,
            city: visitorInfo.city,
            device: visitorInfo.device,
            browser: visitorInfo.browser,
            pageViews: 0
          }
        })
        break
        
      case 'end':
        // End session
        await prisma.session.update({
          where: { sessionId },
          data: {
            endTime: new Date(),
          }
        })
        break
    }
    
    return NextResponse.json({ 
      success: true,
      sessionId 
    })
    
  } catch (error) {
    console.error('Session tracking error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid session data', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to track session' },
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