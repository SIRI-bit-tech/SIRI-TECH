'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useEffect, useState } from 'react'
import { getWebVitalRating } from '@/lib/seo'

export function WebVitals() {
  const [vitalsData, setVitalsData] = useState<Record<string, any>>({})

  useReportWebVitals((metric) => {
    // Calculate rating
    const rating = getWebVitalRating(metric.name, metric.value)
    
    // Update local state for debugging
    setVitalsData(prev => ({
      ...prev,
      [metric.name]: {
        value: metric.value,
        rating,
        id: metric.id,
        timestamp: Date.now(),
      }
    }))

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        custom_map: { metric_id: 'web_vitals' },
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
        custom_parameter_rating: rating,
      })
    }

    // Send to Vercel Analytics if available
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', 'Web Vital', {
        name: metric.name,
        value: metric.value,
        rating,
        id: metric.id,
        label: metric.label,
        delta: metric.delta,
      })
    }

    // Send to our own analytics API with enhanced data
    const payload = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      label: metric.label,
      delta: metric.delta,
      navigationType: metric.navigationType,
      rating,
      url: window.location.href,
      pathname: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    }

    // Use sendBeacon for better reliability, fallback to fetch
    const data = JSON.stringify(payload)
    
    if (navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/web-vitals', blob)
    } else {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to send web vitals:', error)
      })
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating,
        id: metric.id,
        delta: metric.delta,
      })
    }
  })

  // Performance observer for additional metrics
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              fetch('/api/analytics/performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'long-task',
                  duration: entry.duration,
                  startTime: entry.startTime,
                  url: window.location.href,
                  timestamp: Date.now(),
                }),
              }).catch(() => {}) // Silent fail
            }
          }
        })

        longTaskObserver.observe({ entryTypes: ['longtask'] })

        return () => {
          longTaskObserver.disconnect()
        }
      } catch (error) {
        // PerformanceObserver not supported or failed
      }
    }
  }, [])

  // Development-only vitals display
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs font-mono max-w-xs">
        <div className="font-bold mb-1">Web Vitals</div>
        {Object.entries(vitalsData).map(([name, data]) => (
          <div key={name} className="flex justify-between">
            <span>{name}:</span>
            <span className={`ml-2 ${
              data.rating === 'good' ? 'text-green-400' :
              data.rating === 'needs-improvement' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {Math.round(data.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

// Extend Window interface for analytics
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      parameters: Record<string, any>
    ) => void
    va?: (
      command: 'track',
      eventName: string,
      parameters: Record<string, any>
    ) => void
  }
}