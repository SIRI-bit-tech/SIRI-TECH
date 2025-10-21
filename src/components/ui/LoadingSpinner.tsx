'use client'

import { HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'white' | 'glass'
  text?: string
  fullScreen?: boolean
}

const LoadingSpinner = ({
  className,
  size = 'md',
  variant = 'primary',
  text,
  fullScreen = false,
  ...props
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const variantClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    glass: 'text-primary-600 opacity-80',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  const spinnerClasses = cn(
    'animate-spin',
    sizeClasses[size],
    variantClasses[variant],
    className
  )

  const containerClasses = cn(
    'flex items-center justify-center',
    fullScreen && 'fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50',
    text && 'flex-col space-y-2'
  )

  const spinner = (
    <motion.svg
      className={spinnerClasses}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  )

  if (fullScreen || text) {
    return (
      <div className={containerClasses}>
        {spinner}
        {text && (
          <motion.p
            className={cn(
              'font-medium text-gray-700 dark:text-gray-300',
              textSizeClasses[size]
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    )
  }

  return spinner
}

LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner