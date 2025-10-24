'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Button from './Button'
import GlassmorphismCard from '../glassmorphism/GlassmorphismCard'

export interface NavigationItem {
  label: string
  href: string
  active?: boolean
}

export interface NavigationProps {
  items: NavigationItem[]
  logo?: string
  logoHref?: string
  className?: string
  variant?: 'default' | 'glass'
  fixed?: boolean
}

const Navigation = ({
  items,
  logo = 'Portfolio',
  logoHref = '/',
  className,
  variant = 'glass',
  fixed = true,
}: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navClasses = cn(
    'w-full z-40 transition-all duration-300',
    fixed && 'fixed top-0 left-0 right-0',
    scrolled && 'shadow-lg',
    className
  )

  const containerClasses = cn(
    'transition-all duration-300',
    variant === 'glass' && 'glass-nav',
    variant === 'default' && 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'
  )

  const toggleMobileMenu = () => setIsOpen(!isOpen)

  return (
    <nav className={navClasses}>
      <div className={containerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <a
                href={logoHref}
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {logo}
              </a>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {items.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      item.active
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-3 min-h-[44px] min-w-[44px] touch-manipulation"
                animate={false}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
              >
                <motion.div
                  animate={isOpen ? 'open' : 'closed'}
                  className="w-6 h-6 flex flex-col justify-center items-center"
                >
                  <motion.span
                    className="w-6 h-0.5 bg-current block"
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: 45, y: 6 }
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span
                    className="w-6 h-0.5 bg-current block mt-1.5"
                    variants={{
                      closed: { opacity: 1 },
                      open: { opacity: 0 }
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span
                    className="w-6 h-0.5 bg-current block mt-1.5"
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: -45, y: -6 }
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassmorphismCard
                variant="heavy"
                className="mx-4 mb-4 p-4"
                animate={false}
                hover={false}
              >
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'block px-4 py-3 rounded-lg text-base font-medium transition-colors touch-manipulation min-h-[44px] flex items-center',
                        item.active
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                      onClick={() => setIsOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </div>
              </GlassmorphismCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

Navigation.displayName = 'Navigation'

export default Navigation