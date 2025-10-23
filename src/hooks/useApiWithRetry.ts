'use client'

import { useState, useCallback } from 'react'
import { useErrorToast } from '@/components/ui/Toast'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  retries?: number
  retryDelay?: number
  timeout?: number
}

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  retryCount: number
}

interface UseApiWithRetryReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  retryCount: number
  execute: (url: string, options?: ApiOptions) => Promise<T | null>
  retry: () => Promise<T | null>
  reset: () => void
}

export function useApiWithRetry<T = any>(
  defaultOptions: ApiOptions = {}
): UseApiWithRetryReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0,
  })
  
  const [lastRequest, setLastRequest] = useState<{
    url: string
    options: ApiOptions
  } | null>(null)

  const showErrorToast = useErrorToast()

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const executeRequest = useCallback(async (
    url: string, 
    options: ApiOptions = {}
  ): Promise<T | null> => {
    const mergedOptions = { ...defaultOptions, ...options }
    const {
      method = 'GET',
      headers = {},
      body,
      retries = 3,
      retryDelay = 1000,
      timeout = 10000,
    } = mergedOptions

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }))

    // Store request for retry functionality
    setLastRequest({ url, options: mergedOptions })

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        setState(prev => ({ ...prev, retryCount: attempt }))

        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const fetchOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal: controller.signal,
          ...(body && { body: JSON.stringify(body) }),
        }

        const response = await fetch(url, fetchOptions)
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || 
            errorData.message || 
            `HTTP ${response.status}: ${response.statusText}`
          )
        }

        const data = await response.json()
        
        setState(prev => ({
          ...prev,
          data: data.data || data,
          loading: false,
          error: null,
        }))

        return data.data || data

      } catch (error) {
        lastError = error as Error
        
        // Don't retry on certain errors
        if (
          error instanceof Error && (
            error.name === 'AbortError' ||
            error.message.includes('401') ||
            error.message.includes('403') ||
            error.message.includes('404')
          )
        ) {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt)
          await sleep(delay)
        }
      }
    }

    // All retries failed
    const errorMessage = lastError?.message || 'Request failed'
    
    setState(prev => ({
      ...prev,
      loading: false,
      error: errorMessage,
    }))

    // Show error toast for user feedback
    showErrorToast(
      errorMessage,
      'Request Failed',
      {
        action: {
          label: 'Retry',
          onClick: () => retry(),
        },
        duration: 7000,
      }
    )

    return null
  }, [defaultOptions, showErrorToast])

  const retry = useCallback(async (): Promise<T | null> => {
    if (!lastRequest) {
      return null
    }
    return executeRequest(lastRequest.url, lastRequest.options)
  }, [lastRequest, executeRequest])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0,
    })
    setLastRequest(null)
  }, [])

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    retryCount: state.retryCount,
    execute: executeRequest,
    retry,
    reset,
  }
}

// Specialized hooks for common API patterns
export function useApiGet<T = any>(url?: string, options?: Omit<ApiOptions, 'method'>) {
  const api = useApiWithRetry<T>({ ...options, method: 'GET' })
  
  const get = useCallback((requestUrl?: string) => {
    return api.execute(requestUrl || url || '', { method: 'GET' })
  }, [api, url])

  return {
    ...api,
    get,
  }
}

export function useApiPost<T = any>(options?: Omit<ApiOptions, 'method'>) {
  const api = useApiWithRetry<T>({ ...options, method: 'POST' })
  
  const post = useCallback((url: string, data?: any) => {
    return api.execute(url, { method: 'POST', body: data })
  }, [api])

  return {
    ...api,
    post,
  }
}

export function useApiPut<T = any>(options?: Omit<ApiOptions, 'method'>) {
  const api = useApiWithRetry<T>({ ...options, method: 'PUT' })
  
  const put = useCallback((url: string, data?: any) => {
    return api.execute(url, { method: 'PUT', body: data })
  }, [api])

  return {
    ...api,
    put,
  }
}

export function useApiDelete<T = any>(options?: Omit<ApiOptions, 'method'>) {
  const api = useApiWithRetry<T>({ ...options, method: 'DELETE' })
  
  const del = useCallback((url: string) => {
    return api.execute(url, { method: 'DELETE' })
  }, [api])

  return {
    ...api,
    delete: del,
  }
}