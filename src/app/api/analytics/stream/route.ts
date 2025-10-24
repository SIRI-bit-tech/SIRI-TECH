import { NextRequest } from 'next/server'
import { getRealTimeAnalytics } from '@/lib/analytics'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication for admin routes
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const interval = parseInt(searchParams.get('interval') || '30000') // Default 30 seconds
    
    // Validate interval (min 5 seconds, max 5 minutes)
    const validInterval = Math.max(5000, Math.min(300000, interval))
    
    // Create Server-Sent Events stream
    const stream = new ReadableStream({
      start(controller) {
        // Send initial data
        sendAnalyticsUpdate(controller)
        
        // Set up periodic updates
        const intervalId = setInterval(async () => {
          try {
            await sendAnalyticsUpdate(controller)
          } catch (error) {
            console.error('Stream error:', error)
            controller.close()
          }
        }, validInterval)
        
        // Cleanup on stream close
        const cleanup = () => {
          clearInterval(intervalId)
        }
        
        // Handle client disconnect
        request.signal?.addEventListener('abort', cleanup)
        
        // Store cleanup function for later use
        ;(controller as any).cleanup = cleanup
      },
      
      cancel() {
        // Cleanup when stream is cancelled
        if ((this as any).cleanup) {
          (this as any).cleanup()
        }
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })
    
  } catch (error) {
    console.error('Analytics stream error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

async function sendAnalyticsUpdate(controller: ReadableStreamDefaultController) {
  try {
    const realTimeData = await getRealTimeAnalytics()
    
    // Add timestamp and performance metrics
    const updateData = {
      ...realTimeData,
      timestamp: new Date().toISOString(),
      serverTime: Date.now(),
      updateId: Math.random().toString(36).substr(2, 9)
    }
    
    // Format as Server-Sent Event
    const eventData = `data: ${JSON.stringify(updateData)}\n\n`
    
    // Send the data
    controller.enqueue(new TextEncoder().encode(eventData))
    
  } catch (error) {
    console.error('Failed to send analytics update:', error)
    
    // Send error event
    const errorEvent = `event: error\ndata: ${JSON.stringify({ 
      error: 'Failed to fetch analytics data',
      timestamp: new Date().toISOString()
    })}\n\n`
    
    controller.enqueue(new TextEncoder().encode(errorEvent))
  }
}

// Optional: Handle POST requests for configuration updates
export async function POST(request: NextRequest) {
  try {
    // Check authentication for admin routes
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    const { action, config } = body
    
    switch (action) {
      case 'configure':
        // In production, this would update stream configuration
        return new Response(JSON.stringify({
          success: true,
          message: 'Stream configuration updated',
          config
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
        
      case 'broadcast':
        // In production, this could broadcast custom events to all connected clients
        return new Response(JSON.stringify({
          success: true,
          message: 'Event broadcasted',
          event: config
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
    }
    
  } catch (error) {
    console.error('Stream configuration error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}