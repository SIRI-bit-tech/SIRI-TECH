'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'glass' | 'outline'
  inputSize?: 'sm' | 'md' | 'lg'
  error?: boolean
  helperText?: string
  label?: string
  animate?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'default',
    inputSize = 'md',
    error = false,
    helperText,
    label,
    animate = true,
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    const baseClasses = 'w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      default: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500',
      glass: 'bg-glass-light backdrop-blur-md border border-border-glass dark:border-border-glass-dark text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-400 shadow-glass',
      outline: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg',
    }

    const errorClasses = error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : ''

    const inputClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[inputSize],
      errorClasses,
      className
    )

    const labelClasses = cn(
      'block text-sm font-medium mb-2',
      error ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
    )

    const helperTextClasses = cn(
      'mt-1 text-sm',
      error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
    )

    const inputElement = (
      <input
        ref={ref}
        id={inputId}
        className={inputClasses}
        {...props}
      />
    )

    const content = (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        {animate ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {inputElement}
          </motion.div>
        ) : (
          inputElement
        )}
        {helperText && (
          <p className={helperTextClasses}>
            {helperText}
          </p>
        )}
      </div>
    )

    return content
  }
)

Input.displayName = 'Input'

export default Input