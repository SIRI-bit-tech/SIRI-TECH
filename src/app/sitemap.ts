import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://siridev.com'
  
  // Get all published projects with more detailed information
  const projects = await prisma.project.findMany({
    where: { status: 'PUBLISHED' },
    select: { 
      slug: true, 
      updatedAt: true, 
      createdAt: true,
      featured: true 
    },
    orderBy: { updatedAt: 'desc' }
  }).catch(() => [])

  // Get profile update time for about page
  const profile = await prisma.profile.findFirst({
    select: { updatedAt: true }
  }).catch(() => null)

  // Static pages with dynamic last modified dates
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: projects.length > 0 ? projects[0].updatedAt : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: profile?.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: profile?.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // Dynamic project pages with priority based on featured status
  const projectPages = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: project.featured ? 0.9 : 0.8,
  }))

  return [...staticPages, ...projectPages]
}

// Enable ISR for sitemap
export const revalidate = 3600 // Revalidate every hour