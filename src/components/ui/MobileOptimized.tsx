'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useResponsive } from '@/hooks/useResponsive'

interface MobileOptimizedProps {
  children: ReactNode
  fallback?: ReactNode
  threshold?: 'mobile' | 'tablet' | 'desktop'
  className?: string
}

/**
 * Component that conditionally renders content based on screen size
 * Useful for providing different experiences on mobile vs desktop
 */
const MobileOptimized = ({
  children,
  fallback,
  threshold = 'mobile',
  className,
}: MobileOptimizedProps) => {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className={className}>{children}</div>
  }

  const shouldShowFallback = () => {
    switch (threshold) {
      case 'mobile':
        return isMobile
      case 'tablet':
        return isMobile || isTablet
      case 'desktop':
        return !isDesktop
      default:
        return false
    }
  }

  return (
    <div className={className}>
      {shouldShowFallback() && fallback ? fallback : children}
    </div>
  )
}

MobileOptimized.displayName = 'MobileOptimized'

export default MobileOptimized