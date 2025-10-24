'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/layouts/PublicLayout'
import Button from '@/components/ui/Button'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'

interface ProjectsErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProjectsError({ error, reset }: ProjectsErrorProps) {
  useEffect(() => {
    console.error('Projects page error:', error)
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Failed to Load Projects
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              There was an error loading the projects page. This might be a temporary issue.
            </p>

            <div className="space-y-3">
              <Button 
                variant="primary" 
                size="md" 
                className="w-full"
                onClick={reset}
              >
                🔄 Try Again
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/">
                  <Button variant="outline" size="sm" className="w-full">
                    🏠 Home
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="sm" className="w-full">
                    👋 About
                  </Button>
                </Link>
              </div>
            </div>
          </GlassmorphismCard>
        </div>
      </div>
    </PublicLayout>
  )
}