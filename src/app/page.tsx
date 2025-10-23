import { Metadata } from 'next'
import PublicLayout from '@/components/layouts/PublicLayout'
import { HeroSection, SkillsShowcase, FeaturedProjects } from '@/components/sections'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'SIRI DEV - Full-Stack Developer Portfolio',
  description: 'Full-stack developer specializing in modern web technologies. View my projects, skills, and experience in React, Next.js, TypeScript, and more.',
  keywords: ['portfolio', 'full-stack developer', 'React', 'Next.js', 'TypeScript', 'web development'],
  url: '/',
  type: 'website',
})

async function getFeaturedProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: {
        status: 'PUBLISHED',
        featured: true
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
    return projects
  } catch (error) {
    console.error('Error fetching featured projects:', error)
    return []
  }
}

export default async function Home() {
  const featuredProjects = await getFeaturedProjects()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://siridev.com"

  const portfolioSchema = generateStructuredData('CreativeWork', {
    name: 'SIRI DEV Portfolio',
    description: 'Professional portfolio showcasing full-stack web development projects',
    url: siteUrl,
    author: {
      '@type': 'Person',
      name: 'SIRI DEV',
      jobTitle: 'Full-Stack Developer'
    },
    dateCreated: '2024-01-01', // Replace with actual creation date
    dateModified: new Date().toISOString(),
    keywords: 'portfolio, web development, React, Next.js, TypeScript, full-stack developer',
    hasPart: featuredProjects.map(project => ({
      '@type': 'CreativeWork',
      name: project.title,
      description: project.shortDescription,
      url: `${siteUrl}/projects/${project.slug}`,
      keywords: project.technologies.join(', ')
    }))
  })

  return (
    <PublicLayout>
      <HeroSection />
      <SkillsShowcase />
      <FeaturedProjects />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: portfolioSchema
        }}
      />
    </PublicLayout>
  )
}
