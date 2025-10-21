import Link from 'next/link'
import PublicLayout from '@/components/layouts/PublicLayout'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import Button from '@/components/ui/Button'

export default function ProjectNotFound() {
  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <GlassmorphismCard variant="light" className="p-12">
            <div className="text-8xl mb-6">🔍</div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Project Not Found
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              The project you're looking for doesn't exist or may have been moved. 
              Let's get you back to exploring my work.
            </p>
            
            <div className="space-y-4">
              <Link href="/projects">
                <Button variant="primary" size="lg" className="w-full">
                  View All Projects
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="ghost" size="lg" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </GlassmorphismCard>
        </div>
      </div>
    </PublicLayout>
  )
}