'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  loading: boolean
  children: ReactNode
  fallback?: ReactNode
  overlay?: boolean
  blur?: boolean
  className?: string
  loadingText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'white' | 'glass'
}

export default function LoadingState({
  loading,
  children,
  fallback,
  overlay = false,
  blur = true,
  className,
  loadingText,
  size = 'md',
  variant = 'primary',
}: LoadingStateProps) {
  if (loading && fallback) {
    return <>{fallback}</>
  }

  if (loading && !overlay) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <LoadingSpinner 
          size={size} 
          variant={variant} 
          text={loadingText}
        />
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {children}
      
      {loading && overlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'absolute inset-0 flex items-center justify-center z-10 rounded-lg',
            blur 
              ? 'bg-white/80 dark:bg-black/80 backdrop-blur-sm' 
              : 'bg-white/90 dark:bg-black/90'
          )}
        >
          <LoadingSpinner 
            size={size} 
            variant={variant} 
            text={loadingText}
          />
        </motion.div>
      )}
    </div>
  )
}

// Specialized loading components
export function PageLoadingState({ 
  loading, 
  children, 
  className 
}: { 
  loading: boolean
  children: ReactNode
  className?: string 
}) {
  return (
    <LoadingState
      loading={loading}
      overlay={false}
      size="xl"
      variant="glass"
      loadingText="Loading page..."
      className={cn('min-h-[400px]', className)}
    >
      {children}
    </LoadingState>
  )
}

export function CardLoadingState({ 
  loading, 
  children, 
  className 
}: { 
  loading: boolean
  children: ReactNode
  className?: string 
}) {
  return (
    <LoadingState
      loading={loading}
      overlay={true}
      blur={true}
      size="md"
      variant="primary"
      className={className}
    >
      {children}
    </LoadingState>
  )
}

export function ButtonLoadingState({ 
  loading, 
  children, 
  loadingText = 'Loading...',
  className 
}: { 
  loading: boolean
  children: ReactNode
  loadingText?: string
  className?: string 
}) {
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center space-x-2', className)}>
        <LoadingSpinner size="sm" variant="white" />
        <span>{loadingText}</span>
      </div>
    )
  }

  return <>{children}</>
}

export function InlineLoadingState({ 
  loading, 
  text = 'Loading...',
  size = 'sm',
  className 
}: { 
  loading: boolean
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  if (!loading) return null

  return (
    <div className={cn('flex items-center space-x-2 text-gray-600 dark:text-gray-400', className)}>
      <LoadingSpinner size={size} variant="secondary" />
      <span className="text-sm">{text}</span>
    </div>
  )
}