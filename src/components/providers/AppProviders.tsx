'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { ToastProvider } from '../ui/Toast'
import ErrorBoundary from '../ui/ErrorBoundary'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
          console.error('App Error:', error, errorInfo)
        }
      }}
    >
      <ToastProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}