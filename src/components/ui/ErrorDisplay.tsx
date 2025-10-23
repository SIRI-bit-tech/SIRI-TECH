'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Button from './Button'
import { cn } from '@/lib/utils'

interface ErrorDisplayProps {
  error?: string | null
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'inline' | 'card' | 'banner'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: ReactNode
}

export default function ErrorDisplay({
  error,
  title = 'Something went wrong',
  description,
  action,
  variant = 'inline',
  size = 'md',
  className,
  children,
}: ErrorDisplayProps) {
  if (!error && !children) return null

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
  }

  const variantClasses = {
    inline: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg',
    card: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-sm',
    banner: 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-start space-x-3">
        {/* Error Icon */}
        <div className={cn('flex-shrink-0 text-red-600 dark:text-red-400', iconSizes[size])}>
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          {title && (
            <h3 className="font-medium text-red-800 dark:text-red-200 mb-1">
              {title}
            </h3>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-red-700 dark:text-red-300 leading-relaxed">
              {error}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1 leading-relaxed">
              {description}
            </p>
          )}

          {/* Custom Content */}
          {children && (
            <div className="mt-2">
              {children}
            </div>
          )}

          {/* Action Button */}
          {action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-800/30"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Specialized error components
export function ValidationError({ 
  errors, 
  className 
}: { 
  errors: Record<string, string>
  className?: string 
}) {
  const errorList = Object.entries(errors).filter(([_, error]) => error)
  
  if (errorList.length === 0) return null

  return (
    <ErrorDisplay
      variant="inline"
      size="sm"
      title="Please fix the following errors:"
      className={className}
    >
      <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
        {errorList.map(([field, error]) => (
          <li key={field}>
            <span className="font-medium capitalize">{field}:</span> {error}
          </li>
        ))}
      </ul>
    </ErrorDisplay>
  )
}

export function NetworkError({ 
  onRetry, 
  className 
}: { 
  onRetry?: () => void
  className?: string 
}) {
  return (
    <ErrorDisplay
      variant="card"
      title="Connection Error"
      error="Unable to connect to the server. Please check your internet connection and try again."
      action={onRetry ? {
        label: 'Retry',
        onClick: onRetry,
      } : undefined}
      className={className}
    />
  )
}

export function ServerError({ 
  onRetry, 
  className 
}: { 
  onRetry?: () => void
  className?: string 
}) {
  return (
    <ErrorDisplay
      variant="card"
      title="Server Error"
      error="An unexpected server error occurred. This has been logged and will be investigated."
      action={onRetry ? {
        label: 'Try Again',
        onClick: onRetry,
      } : undefined}
      className={className}
    />
  )
}

export function NotFoundError({ 
  resource = 'Resource',
  onGoBack,
  className 
}: { 
  resource?: string
  onGoBack?: () => void
  className?: string 
}) {
  return (
    <ErrorDisplay
      variant="card"
      title={`${resource} Not Found`}
      error={`The ${resource.toLowerCase()} you're looking for doesn't exist or has been moved.`}
      action={onGoBack ? {
        label: 'Go Back',
        onClick: onGoBack,
      } : undefined}
      className={className}
    />
  )
}