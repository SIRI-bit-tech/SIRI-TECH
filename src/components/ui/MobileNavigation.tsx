'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Button from './Button'
import GlassmorphismCard from '../glassmorphism/GlassmorphismCard'

export interface MobileNavigationItem {
  label: string
  href: string
  icon?: string
  active?: boolean
}

export interface MobileNavigationProps {
  items: MobileNavigationItem[]
  className?: string
  onItemClick?: (item: MobileNavigationItem) => void
}

const MobileNavigation = ({
  items,
  className,
  onItemClick,
}: MobileNavigationProps) => {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()

  // Auto-hide navigation on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleItemClick = (item: MobileNavigationItem) => {
    onItemClick?.(item)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed bottom-4 left-4 right-4 z-50 md:hidden',
            className
          )}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassmorphismCard
            variant="heavy"
            className="p-2"
            animate={false}
            hover={false}
          >
            <div className="flex justify-around items-center">
              {items.map((item, index) => {
                const isActive = item.active || pathname === item.href
                
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 touch-manipulation min-w-[60px]',
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    onClick={() => handleItemClick(item)}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.icon && (
                      <span className="text-lg mb-1">{item.icon}</span>
                    )}
                    <span className="text-xs font-medium leading-tight">
                      {item.label}
                    </span>
                  </motion.a>
                )
              })}
            </div>
          </GlassmorphismCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

MobileNavigation.displayName = 'MobileNavigation'

export default MobileNavigation