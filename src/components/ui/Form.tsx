'use client'

import { FormHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  variant?: 'default' | 'glass'
  animate?: boolean
  children: ReactNode
}

export interface FormFieldProps {
  children: ReactNode
  className?: string
}

export interface FormErrorProps {
  message?: string
  className?: string
}

export interface FormSuccessProps {
  message?: string
  className?: string
}

const Form = ({
  className,
  variant = 'default',
  animate = true,
  children,
  ...props
}: FormProps) => {
  const baseClasses = 'space-y-6'
  
  const variantClasses = {
    default: '',
    glass: 'p-6 rounded-2xl bg-glass-medium backdrop-blur-md border border-border-glass shadow-glass',
  }

  const formClasses = cn(
    baseClasses,
    variantClasses[variant],
    className
  )

  if (animate) {
    const { 
      onDrag, onDragStart, onDragEnd, onAnimationStart, onAnimationEnd, 
      onTransitionEnd, ...motionProps 
    } = props
    return (
      <motion.form
        className={formClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        {...motionProps}
      >
        {children}
      </motion.form>
    )
  }

  return (
    <form className={formClasses} {...props}>
      {children}
    </form>
  )
}

const FormField = ({ children, className }: FormFieldProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  )
}

const FormError = ({ message, className }: FormErrorProps) => {
  if (!message) return null

  return (
    <motion.div
      className={cn(
        'flex items-center space-x-2 text-sm text-red-600 dark:text-red-400',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </motion.div>
  )
}

const FormSuccess = ({ message, className }: FormSuccessProps) => {
  if (!message) return null

  return (
    <motion.div
      className={cn(
        'flex items-center space-x-2 text-sm text-green-600 dark:text-green-400',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </motion.div>
  )
}

Form.Field = FormField
Form.Error = FormError
Form.Success = FormSuccess

Form.displayName = 'Form'
FormField.displayName = 'FormField'
FormError.displayName = 'FormError'
FormSuccess.displayName = 'FormSuccess'

export default Form
export { FormField, FormError, FormSuccess }