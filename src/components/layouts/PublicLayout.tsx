'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Navigation, { NavigationItem } from '../ui/Navigation'
import Footer from './Footer'

interface PublicLayoutProps {
  children: ReactNode
  className?: string
}

const PublicLayout = ({ children, className }: PublicLayoutProps) => {
  const pathname = usePathname()
  
  const navigationItems: NavigationItem[] = [
    { label: 'Home', href: '/', active: pathname === '/' },
    { label: 'Projects', href: '/projects', active: pathname.startsWith('/projects') },
    { label: 'About', href: '/about', active: pathname === '/about' },
    { label: 'Resume', href: '/resume', active: pathname === '/resume' },
    { label: 'Contact', href: '/contact', active: pathname === '/contact' },
  ]

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