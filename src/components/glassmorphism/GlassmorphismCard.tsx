'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface GlassmorphismCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'medium' | 'heavy' | 'dark' | 'dark-medium' | 'dark-heavy'
  blur?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  shadow?: 'glass' | 'glass-lg' | 'glass-xl' | 'none'
  border?: boolean
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  animate?: boolean
  hover?: boolean
}

const GlassmorphismCard = forwardRef<HTMLDivElement, GlassmorphismCardProps>(
  ({
    className,
    variant = 'medium',
    blur = 'md',
    shadow = 'glass',
    border = true,
    rounded = 'xl',
    animate = true,
    hover = true,
    children,
    ...props
  }, ref) => {
    const baseClasses = 'relative overflow-hidden'
    
    const variantClasses = {
      light: 'bg-glass-light',
      medium: 'bg-glass-medium',
      heavy: 'bg-glass-heavy',
      dark: 'bg-glass-dark',
      'dark-medium': 'bg-glass-dark-medium',
      'dark-heavy': 'bg-glass-dark-heavy',
    }

    const blurClasses = {
      xs: 'backdrop-blur-xs',
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl',
      '2xl': 'backdrop-blur-2xl',
      '3xl': 'backdrop-blur-3xl',
    }

    const shadowClasses = {
      glass: 'shadow-glass',
      'glass-lg': 'shadow-glass-lg',
      'glass-xl': 'shadow-glass-xl',
      none: '',
    }

    const roundedClasses = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full',
    }

    const borderClass = border ? 'border border-border-glass dark:border-border-glass-dark' : ''
    const hoverClass = hover ? 'transition-all duration-300 hover:scale-[1.02] hover:shadow-glass-lg' : ''

    const cardClasses = cn(
      baseClasses,
      variantClasses[variant],
      blurClasses[blur],
      shadowClasses[shadow],
      roundedClasses[rounded],
      borderClass,
      hoverClass,
      className
    )

    if (animate) {
      const { 
        onDrag, onDragStart, onDragEnd, onAnimationStart, onAnimationEnd, 
        onTransitionEnd, ...motionProps 
      } = props
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={hover ? { scale: 1.02 } : undefined}
          {...motionProps}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    )
  }
)

GlassmorphismCard.displayName = 'GlassmorphismCard'

export default GlassmorphismCard