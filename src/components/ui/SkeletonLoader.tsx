'use client'

import { HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface SkeletonLoaderProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'image' | 'button' | 'avatar' | 'custom'
  lines?: number
  width?: string | number
  height?: string | number
  rounded?: boolean
  animated?: boolean
}

const SkeletonLoader = ({
  className,
  variant = 'text',
  lines = 1,
  width,
  height,
  rounded = false,
  animated = true,
  ...props
}: SkeletonLoaderProps) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  const animationClasses = animated ? 'animate-pulse' : ''
  
  const variantClasses = {
    text: 'h-4 rounded',
    card: 'h-48 rounded-lg',
    image: 'aspect-video rounded-lg',
    button: 'h-10 rounded-md',
    avatar: 'w-12 h-12 rounded-full',
    custom: rounded ? 'rounded' : '',
  }

  const skeletonClasses = cn(
    baseClasses,
    animationClasses,
    variantClasses[variant],
    className
  )

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              skeletonClasses,
              index === lines - 1 && 'w-3/4' // Last line is shorter
            )}
            style={style}
            initial={animated ? { opacity: 0.6 } : undefined}
            animate={animated ? { opacity: [0.6, 1, 0.6] } : undefined}
            transition={animated ? {
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.1,
            } : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={skeletonClasses}
      style={style}
      initial={animated ? { opacity: 0.6 } : undefined}
      animate={animated ? { opacity: [0.6, 1, 0.6] } : undefined}
      transition={animated ? {
        duration: 1.5,
        repeat: Infinity,
      } : undefined}
      {...props}
    />
  )
}

// Predefined skeleton components for common use cases
export const TextSkeleton = ({ lines = 3, ...props }: Omit<SkeletonLoaderProps, 'variant'>) => (
  <SkeletonLoader variant="text" lines={lines} {...props} />
)

export const CardSkeleton = ({ ...props }: Omit<SkeletonLoaderProps, 'variant'>) => (
  <SkeletonLoader variant="card" {...props} />
)

export const ImageSkeleton = ({ ...props }: Omit<SkeletonLoaderProps, 'variant'>) => (
  <SkeletonLoader variant="image" {...props} />
)

export const ButtonSkeleton = ({ ...props }: Omit<SkeletonLoaderProps, 'variant'>) => (
  <SkeletonLoader variant="button" {...props} />
)

export const AvatarSkeleton = ({ ...props }: Omit<SkeletonLoaderProps, 'variant'>) => (
  <SkeletonLoader variant="avatar" {...props} />
)

// Complex skeleton layouts
export const ProjectCardSkeleton = () => (
  <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
    <ImageSkeleton />
    <div className="space-y-2">
      <SkeletonLoader variant="text" width="75%" height={20} />
      <TextSkeleton lines={2} />
    </div>
    <div className="flex gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonLoader key={i} variant="button" width={60} height={24} />
      ))}
    </div>
  </div>
)

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <AvatarSkeleton />
      <div className="space-y-2 flex-1">
        <SkeletonLoader variant="text" width="40%" height={24} />
        <SkeletonLoader variant="text" width="60%" height={16} />
      </div>
    </div>
    <TextSkeleton lines={4} />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonLoader key={i} variant="button" height={32} />
      ))}
    </div>
  </div>
)

export const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2">
          <SkeletonLoader variant="text" width="60%" height={16} />
          <SkeletonLoader variant="text" width="40%" height={24} />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonLoader variant="custom" height={300} rounded />
      <SkeletonLoader variant="custom" height={300} rounded />
    </div>
  </div>
)

SkeletonLoader.displayName = 'SkeletonLoader'

export default SkeletonLoader