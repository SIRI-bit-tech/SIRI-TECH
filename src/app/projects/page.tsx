import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import PublicLayout from '@/components/layouts/PublicLayout'
import { ProjectGallery } from '@/components/projects'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'

export const metadata: Metadata = {
  title: 'Projects | SIRI DEV - Full-Stack Developer Portfolio',
  description: 'Explore my portfolio of full-stack web development projects. Built with modern technologies like React, Next.js, TypeScript, and more.',
  keywords: ['projects', 'portfolio', 'web development', 'React', 'Next.js', 'TypeScript', 'full-stack'],
  openGraph: {
    title: 'Projects | SIRI DEV Portfolio',
    description: 'Explore my portfolio of full-stack web development projects.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects | SIRI DEV Portfolio',
    description: 'Explore my portfolio of full-stack web development projects.',
  },
}

async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: {
        status: 'PUBLISHED'
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <PublicLayout>
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <GlassmorphismCard 
                variant="light" 
                className="px-6 py-3 inline-block"
                animate={false}
              >
                <span className="text-primary-600 dark:text-primary-400 font-medium">
                  💼 Portfolio
                </span>
              </GlassmorphismCard>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              My Projects
            </h1>
            
            <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              A collection of my work showcasing full-stack web applications, 
              built with modern technologies and best practices. Each project 
              demonstrates different aspects of web development from frontend 
              design to backend architecture.
            </p>
          </div>

          {/* Projects Gallery */}
          <ProjectGallery projects={projects} />

          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                "name": "SIRI DEV Projects Portfolio",
                "description": "A collection of full-stack web development projects by SIRI DEV",
                "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://siridev.com'}/projects`,
                "mainEntity": {
                  "@type": "ItemList",
                  "numberOfItems": projects.length,
                  "itemListElement": projects.map((project, index) => ({
                    "@type": "CreativeWork",
                    "position": index + 1,
                    "name": project.title,
                    "description": project.shortDescription,
                    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://siridev.com'}/projects/${project.slug}`,
                    "dateCreated": project.createdAt.toISOString(),
                    "keywords": project.technologies.join(", "),
                    ...(project.liveUrl && { "sameAs": project.liveUrl }),
                  }))
                }
              })
            }}
          />
        </div>
      </div>
    </PublicLayout>
  )
}