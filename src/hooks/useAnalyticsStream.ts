import { useState, useEffect, useRef, useCallback } from 'react'

interface AnalyticsStreamData {
  activeSessions: number
  recentViews: number
  recentActivity: Array<{
    pageUrl: string
    pageTitle?: string
    country?: string
    city?: string
    device: string
    browser: string
    timestamp: string
  }>
  timestamp: string
  serverTime: number
  updateId: string
}

interface UseAnalyticsStreamOptions {
  enabled?: boolean
  interval?: number
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export function useAnalyticsStream(options: UseAnalyticsStreamOptions = {}) {
  const {
    enabled = true,
    interval = 30000,
    onError,
    onConnect,
    onDisconnect
  } = options

  const [data, setData] = useState<AnalyticsStreamData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxReconnectAttempts = 5
  const reconnectDelay = 5000 // 5 seconds

  const connect = useCallback(() => {
    if (!enabled || eventSourceRef.current) {
      return
    }

    try {
      const url = `/api/analytics/stream?interval=${interval}`
      const eventSource = new EventSource(url)
      
      eventSource.onopen = () => {
        setIsConnected(true)
        setError(null)
        setConnectionAttempts(0)
        onConnect?.()
      }
      
      eventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data)
          setData(parsedData)
        } catch (parseError) {
          console.error('Failed to parse analytics stream data:', parseError)
          setError(new Error('Failed to parse stream data'))
        }
      }
      
      eventSource.onerror = (event) => {
        console.error('Analytics stream error:', event)
        setIsConnected(false)
        
        const streamError = new Error('Analytics stream connection error')
        setError(streamError)
        onError?.(streamError)
        
        // Attempt to reconnect
        if (connectionAttempts < maxReconnectAttempts) {
          setConnectionAttempts(prev => prev + 1)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            eventSource.close()
            eventSourceRef.current = null
            connect()
          }, reconnectDelay * Math.pow(2, connectionAttempts)) // Exponential backoff
        } else {
          console.error('Max reconnection attempts reached')
          onDisconnect?.()
        }
      }
      
      eventSourceRef.current = eventSource
      
    } catch (error) {
      console.error('Failed to create analytics stream:', error)
      setError(error as Error)
      onError?.(error as Error)
    }
  }, [enabled, interval, connectionAttempts, onConnect, onError, onDisconnect])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    setIsConnected(false)
    setConnectionAttempts(0)
    onDisconnect?.()
  }, [onDisconnect])

  const reconnect = useCallback(() => {
    disconnect()
    setConnectionAttempts(0)
    setTimeout(connect, 1000) // Wait 1 second before reconnecting
  }, [connect, disconnect])

  // Effect to manage connection
  useEffect(() => {
    if (enabled) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    data,
    isConnected,
    error,
    connectionAttempts,
    connect,
    disconnect,
    reconnect,
    maxReconnectAttempts
  }
}

// Hook for analytics stream with automatic fallback to polling
export function useAnalyticsWithFallback(options: UseAnalyticsStreamOptions = {}) {
  const streamResult = useAnalyticsStream(options)
  const [pollingData, setPollingData] = useState<AnalyticsStreamData | null>(null)
  const [usePolling, setUsePolling] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { enabled = true, interval = 30000 } = options

  // Fallback to polling if stream fails
  useEffect(() => {
    if (streamResult.connectionAttempts >= streamResult.maxReconnectAttempts && enabled) {
      setUsePolling(true)
      
      // Start polling
      const poll = async () => {
        try {
          const response = await fetch('/api/analytics/realtime')
          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setPollingData({
                ...result.data,
                timestamp: new Date().toISOString(),
                serverTime: Date.now(),
                updateId: Math.random().toString(36).substr(2, 9)
              })
            }
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }
      
      // Initial poll
      poll()
      
      // Set up polling interval
      pollingIntervalRef.current = setInterval(poll, interval)
    } else {
      setUsePolling(false)
      
      // Clear polling if stream is working
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [streamResult.connectionAttempts, streamResult.maxReconnectAttempts, enabled, interval])

  return {
    ...streamResult,
    data: usePolling ? pollingData : streamResult.data,
    isPolling: usePolling,
    connectionMethod: usePolling ? 'polling' : 'stream'
  }
}