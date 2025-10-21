'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  animate?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    animate = true,
    disabled,
    children,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg focus:ring-purple-500',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg focus:ring-gray-500',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500',
      glass: 'bg-glass-medium backdrop-blur-md border border-border-glass hover:bg-glass-heavy text-gray-900 dark:text-white shadow-glass hover:shadow-glass-lg focus:ring-purple-500',
      outline: 'border border-slate-600/50 hover:bg-slate-700/50 text-slate-300 hover:text-white focus:ring-purple-500',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg',
      xl: 'px-8 py-4 text-lg rounded-xl',
    }

    const buttonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    const isDisabled = disabled || loading

    const buttonContent = (
      <>
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
          </svg>
        )}
        {children}
      </>
    )

    if (animate && !isDisabled) {
      const { 
        onDrag, onDragStart, onDragEnd, onAnimationStart, onAnimationEnd, 
        onTransitionEnd, ...motionProps 
      } = props
      return (
        <motion.button
          ref={ref}
          className={buttonClasses}
          disabled={isDisabled}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
          {...motionProps}
        >
          {buttonContent}
        </motion.button>
      )
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button