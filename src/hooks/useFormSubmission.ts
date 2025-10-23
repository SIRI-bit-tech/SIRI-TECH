'use client'

import { useState, useCallback } from 'react'
import { useSuccessToast, useErrorToast } from '@/components/ui/Toast'

interface FormSubmissionOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  successMessage?: string
  errorMessage?: string
  resetOnSuccess?: boolean
}

interface FormSubmissionState {
  loading: boolean
  error: string | null
  success: boolean
}

interface UseFormSubmissionReturn<T> {
  state: FormSubmissionState
  submit: (submitFn: () => Promise<T>) => Promise<T | null>
  reset: () => void
  setError: (error: string | null) => void
  setSuccess: (success: boolean) => void
}

export function useFormSubmission<T = any>(
  options: FormSubmissionOptions<T> = {}
): UseFormSubmissionReturn<T> {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    resetOnSuccess = true,
  } = options

  const [state, setState] = useState<FormSubmissionState>({
    loading: false,
    error: null,
    success: false,
  })

  const showSuccessToast = useSuccessToast()
  const showErrorToast = useErrorToast()

  const submit = useCallback(async (submitFn: () => Promise<T>): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }))

    try {
      const result = await submitFn()
      
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
      }))

      // Show success toast
      if (successMessage) {
        showSuccessToast(successMessage)
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result)
      }

      // Reset state after success if configured
      if (resetOnSuccess) {
        setTimeout(() => {
          setState(prev => ({ ...prev, success: false }))
        }, 3000)
      }

      return result

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred'
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }))

      // Show error toast
      const displayErrorMessage = errorMessage || errorMsg
      showErrorToast(displayErrorMessage)

      // Call error callback
      if (onError) {
        onError(errorMsg)
      }

      return null
    }
  }, [onSuccess, onError, successMessage, errorMessage, resetOnSuccess, showSuccessToast, showErrorToast])

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
    })
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const setSuccess = useCallback((success: boolean) => {
    setState(prev => ({ ...prev, success }))
  }, [])

  return {
    state,
    submit,
    reset,
    setError,
    setSuccess,
  }
}

// Specialized hook for API form submissions
export function useApiFormSubmission<T = any>(
  endpoint: string,
  options: FormSubmissionOptions<T> & {
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  } = {}
) {
  const { method = 'POST', ...formOptions } = options
  const formSubmission = useFormSubmission<T>(formOptions)

  const submitToApi = useCallback(async (data: any) => {
    return formSubmission.submit(async () => {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || result
    })
  }, [endpoint, method, formSubmission])

  return {
    ...formSubmission,
    submitToApi,
  }
}