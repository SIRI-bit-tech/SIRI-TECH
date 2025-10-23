'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import Link from 'next/link'
import Button from './Button'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Send error to analytics in production
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      }).catch(() => {
        // Silent fail for error reporting
      })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <GlassmorphismCard variant="medium" className="p-8">
              {/* Error Icon */}
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 text-red-400">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                An unexpected error occurred in this section. This has been logged for investigation.
              </p>

              {/* Error Details (Development only) */}
              {this.props.showDetails && process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <details className="text-xs text-red-600 dark:text-red-400">
                      <summary className="cursor-pointer hover:text-red-700 dark:hover:text-red-300">
                        Component Stack
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  size="md" 
                  className="w-full"
                  onClick={this.handleReset}
                >
                  🔄 Try Again
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/">
                    <Button variant="outline" size="sm" className="w-full">
                      🏠 Home
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="sm" className="w-full">
                      📧 Report
                    </Button>
                  </Link>
                </div>
              </div>
            </GlassmorphismCard>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary