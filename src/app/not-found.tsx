import { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/layouts/PublicLayout'
import Button from '@/components/ui/Button'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: '404 - Page Not Found',
  description: 'The page you are looking for could not be found. Return to the homepage or explore other sections of the portfolio.',
  noIndex: true,
})

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <GlassmorphismCard variant="medium" className="p-8">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                404
              </div>
              <div className="w-24 h-24 mx-auto mb-6 text-gray-400 dark:text-gray-600">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.691-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Sorry, the page you are looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link href="/">
                <Button variant="primary" size="lg" className="w-full">
                  🏠 Go Home
                </Button>
              </Link>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/projects">
                  <Button variant="outline" size="md" className="w-full">
                    📁 Projects
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="md" className="w-full">
                    👋 About
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search Suggestion */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Looking for something specific?
              </p>
              <Link 
                href="/contact"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors text-sm font-medium"
              >
                Contact me for help →
              </Link>
            </div>
          </GlassmorphismCard>
        </div>
      </div>
    </PublicLayout>
  )
}