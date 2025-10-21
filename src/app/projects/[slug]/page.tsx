import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PublicLayout from '@/components/layouts/PublicLayout'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import Button from '@/components/ui/Button'
import { ProjectGallery } from '@/components/projects'

interface ProjectPageProps {
  params: {
    slug: string
  }
}

async function getProject(slug: string) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        slug,
        status: 'PUBLISHED'
      }
    })
    return project
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

async function getRelatedProjects(currentProjectId: string, technologies: string[]) {
  try {
    const relatedProjects = await prisma.project.findMany({
      where: {
        id: { not: currentProjectId },
        status: 'PUBLISHED',
        OR: technologies.map(tech => ({
          technologies: {
            has: tech
          }
        }))
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    })
    return relatedProjects
  } catch (error) {
    console.error('Error fetching related projects:', error)
    return []
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProject(params.slug)
  
  if (!project) {
    return {
      title: 'Project Not Found | SIRI DEV Portfolio'
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://siridev.com'
  const projectUrl = `${siteUrl}/projects/${project.slug}`
  const imageUrl = project.images?.[0] || `${siteUrl}/api/og?title=${encodeURIComponent(project.title)}`

  return {
    title: `${project.title} | SIRI DEV Portfolio`,
    description: project.shortDescription,
    keywords: ['project', 'portfolio', ...project.technologies],
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      type: 'article',
      url: projectUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        }
      ],
      publishedTime: project.createdAt.toISOString(),
      modifiedTime: project.updatedAt.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.shortDescription,
      images: [imageUrl],
    },
    alternates: {
      canonical: projectUrl,
    },
  }
}

export async function generateStaticParams() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true }
    })
    
    return projects.map((project) => ({
      slug: project.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.slug)
  
  if (!project) {
    notFound()
  }

  const relatedProjects = await getRelatedProjects(project.id, project.technologies)

  return (
    <PublicLayout>
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/projects" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Projects
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 dark:text-white font-medium">
                {project.title}
              </li>
            </ol>
          </nav>

          {/* Project Header */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  {project.featured && (
                    <GlassmorphismCard 
                      variant="dark"
                      className="px-3 py-1"
                      animate={false}
                    >
                      <span className="text-xs font-medium text-white">
                        ⭐ Featured Project
                      </span>
                    </GlassmorphismCard>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  {project.title}
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                  {project.shortDescription}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  {project.liveUrl && (
                    <a 
                      href={project.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="primary" size="lg">
                        🚀 View Live Demo
                      </Button>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a 
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="lg">
                        📚 View Source Code
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Technologies */}
              <div className="lg:w-80">
                <GlassmorphismCard variant="light" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-2 text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </GlassmorphismCard>
              </div>
            </div>
          </div>

          {/* Project Images */}
          {project.images && project.images.length > 0 && (
            <div className="mb-12">
              <GlassmorphismCard variant="medium" className="overflow-hidden">
                {project.images.length === 1 ? (
                  <div className="relative aspect-video">
                    <Image
                      src={project.images[0]}
                      alt={`${project.title} screenshot`}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                    {project.images.map((image, index) => (
                      <div key={index} className="relative aspect-video">
                        <Image
                          src={image}
                          alt={`${project.title} screenshot ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          priority={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </GlassmorphismCard>
            </div>
          )}

          {/* Project Description */}
          <div className="mb-16">
            <GlassmorphismCard variant="light" className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                About This Project
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            </GlassmorphismCard>
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Related Projects
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Other projects using similar technologies
                </p>
              </div>
              
              <ProjectGallery 
                projects={relatedProjects} 
                showFilters={false} 
                showSorting={false} 
              />
            </div>
          )}

          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CreativeWork",
                "name": project.title,
                "description": project.description,
                "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://siridev.com'}/projects/${project.slug}`,
                "dateCreated": project.createdAt.toISOString(),
                "dateModified": project.updatedAt.toISOString(),
                "keywords": project.technologies.join(", "),
                "creator": {
                  "@type": "Person",
                  "name": "SIRI DEV",
                  "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://siridev.com'
                },
                ...(project.images && project.images.length > 0 && {
                  "image": project.images.map(img => ({
                    "@type": "ImageObject",
                    "url": img,
                    "description": `${project.title} screenshot`
                  }))
                }),
                ...(project.liveUrl && { "sameAs": project.liveUrl }),
                "about": project.technologies.map(tech => ({
                  "@type": "Thing",
                  "name": tech
                }))
              })
            }}
          />
        </div>
      </div>
    </PublicLayout>
  )
}