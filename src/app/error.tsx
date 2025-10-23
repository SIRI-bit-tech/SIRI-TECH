'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
    
    // Send error to analytics
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      }).catch(() => {
        // Silent fail for error reporting
      })
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full text-center">
        <GlassmorphismCard variant="medium" className="p-8">
          {/* Error Illustration */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 text-red-400">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            An unexpected error occurred. This has been logged and will be investigated.
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
              <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full"
              onClick={reset}
            >
              🔄 Try Again
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Link href="/">
                <Button variant="outline" size="md" className="w-full">
                  🏠 Home
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="md" className="w-full">
                  📧 Report Issue
                </Button>
              </Link>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If this problem persists, please{' '}
              <Link 
                href="/contact"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-medium"
              >
                contact me
              </Link>
              {' '}with details about what you were doing.
            </p>
          </div>
        </GlassmorphismCard>
      </div>
    </div>
  )
}