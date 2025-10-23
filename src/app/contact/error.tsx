'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/layouts/PublicLayout'
import Button from '@/components/ui/Button'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'

interface ContactErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ContactError({ error, reset }: ContactErrorProps) {
  useEffect(() => {
    console.error('Contact page error:', error)
  }, [error])

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <GlassmorphismCard variant="medium" className="p-8">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 text-red-400">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Contact Form Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              There was an error loading the contact form. You can still reach me through other channels.
            </p>

            <div className="space-y-3">
              <Button 
                variant="primary" 
                size="md" 
                className="w-full"
                onClick={reset}
              >
                🔄 Reload Form
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/">
                  <Button variant="outline" size="sm" className="w-full">
                    🏠 Home
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button variant="outline" size="sm" className="w-full">
                    📁 Projects
                  </Button>
                </Link>
              </div>
            </div>

            {/* Alternative contact methods */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Alternative ways to reach me:
              </p>
              <div className="space-y-2 text-sm">
                <a 
                  href="mailto:contact@siridev.com" 
                  className="block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  📧 contact@siridev.com
                </a>
                <a 
                  href="https://linkedin.com/in/siridev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  💼 LinkedIn Profile
                </a>
              </div>
            </div>
          </GlassmorphismCard>
        </div>
      </div>
    </PublicLayout>
  )
}