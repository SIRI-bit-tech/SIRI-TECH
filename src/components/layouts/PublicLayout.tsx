'use client'

import { ReactNode } from 'react'
import Navigation, { NavigationItem } from '../ui/Navigation'
import Footer from './Footer'

interface PublicLayoutProps {
  children: ReactNode
  className?: string
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/', active: true },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Resume', href: '/resume' },
  { label: 'Contact', href: '/contact' },
]

const PublicLayout = ({ children, className }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation 
        items={navigationItems}
        logo="Portfolio"
        logoHref="/"
        variant="glass"
        fixed={true}
      />
      
      {/* Main content with top padding to account for fixed navigation */}
      <main className={`pt-16 ${className || ''}`}>
        {children}
      </main>
      
      <Footer />
    </div>
  )
}

PublicLayout.displayName = 'PublicLayout'

export default PublicLayout