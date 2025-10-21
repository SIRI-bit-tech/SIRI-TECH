'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface AnalyticsTrackerProps {
  enabled?: boolean
}

export default function AnalyticsTracker({ enabled = true }: AnalyticsTrackerProps) {
  const pathname = usePathname()
  const sessionIdRef = useRef<string | null>(null)
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // Initialize session on first load
    initializeSession()

    // Track page view when pathname changes
    if (pathname !== lastTrackedPath.current) {
      trackPageView(pathname)
      lastTrackedPath.current = pathname
    }

    // Set up heartbeat to keep session alive
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat()
    }, 30000) // Every 30 seconds

    // Track session end on page unload
    const handleBeforeUnload = () => {
      endSession()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(heartbeatInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [pathname, enabled])

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/analytics/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        sessionIdRef.current = data.sessionId
      }
    } catch (error) {
      console.warn('Failed to initialize analytics session:', error)
    }
  }

  const trackPageView = async (path: string) => {
    if (!sessionIdRef.current) return

    try {
      const pageTitle = document.title || getPageTitle(path)
      const referrer = document.referrer || undefined

      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageUrl: path,
          pageTitle,
          referrer,
          sessionId: sessionIdRef.current
        }),
      })
    } catch (error) {
      console.warn('Failed to track page view:', error)
    }
  }

  const sendHeartbeat = async () => {
    if (!sessionIdRef.current) return

    try {
      await fetch('/api/analytics/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          action: 'heartbeat'
        }),
      })
    } catch (error) {
      console.warn('Failed to send analytics heartbeat:', error)
    }
  }

  const endSession = async () => {
    if (!sessionIdRef.current) return

    try {
      // Use sendBeacon for reliable delivery on page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/analytics/session',
          JSON.stringify({
            sessionId: sessionIdRef.current,
            action: 'end'
          })
        )
      } else {
        await fetch('/api/analytics/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            action: 'end'
          }),
        })
      }
    } catch (error) {
      console.warn('Failed to end analytics session:', error)
    }
  }

  return null // This component doesn't render anything
}

function getPageTitle(pathname: string): string {
  const pathMap: Record<string, string> = {
    '/': 'Home',
    '/projects': 'Projects',
    '/about': 'About',
    '/contact': 'Contact',
    '/resume': 'Resume'
  }

  if (pathMap[pathname]) {
    return pathMap[pathname]
  }

  if (pathname.startsWith('/projects/')) {
    return 'Project Details'
  }

  return pathname
    .split('/')
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ') || 'Home'
}