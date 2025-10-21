'use client'

import { useCallback, useRef } from 'react'

interface TrackEventOptions {
  pageUrl?: string
  pageTitle?: string
  referrer?: string
  sessionId?: string
}

export function useAnalytics() {
  const sessionIdRef = useRef<string | null>(null)

  const trackEvent = useCallback(async (options: TrackEventOptions = {}) => {
    try {
      const {
        pageUrl = window.location.pathname,
        pageTitle = document.title,
        referrer = document.referrer || undefined,
        sessionId = sessionIdRef.current
      } = options

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageUrl,
          pageTitle,
          referrer,
          sessionId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.sessionId) {
          sessionIdRef.current = data.sessionId
        }
        return data
      }
    } catch (error) {
      console.warn('Failed to track analytics event:', error)
    }
  }, [])

  const trackPageView = useCallback(async (path?: string, title?: string) => {
    return trackEvent({
      pageUrl: path,
      pageTitle: title
    })
  }, [trackEvent])

  const initSession = useCallback(async () => {
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
        return data.sessionId
      }
    } catch (error) {
      console.warn('Failed to initialize analytics session:', error)
    }
  }, [])

  const endSession = useCallback(async () => {
    if (!sessionIdRef.current) return

    try {
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
    } catch (error) {
      console.warn('Failed to end analytics session:', error)
    }
  }, [])

  return {
    trackEvent,
    trackPageView,
    initSession,
    endSession,
    sessionId: sessionIdRef.current
  }
}