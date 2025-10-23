'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'
import { cn } from '@/lib/utils'

interface FormLoadingStateProps {
  loading: boolean
  children: ReactNode
  loadingText?: string
  className?: string
  overlay?: boolean
}

export default function FormLoadingState({
  loading,
  children,
  loadingText = 'Processing...',
  className,
  overlay = true,
}: FormLoadingStateProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      
      {loading && overlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
        >
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner size="lg" variant="primary" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {loadingText}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}