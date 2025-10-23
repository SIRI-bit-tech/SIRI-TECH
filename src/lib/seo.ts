import { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://siridev.com'
const siteName = 'SIRI DEV Portfolio'
const defaultTitle = 'SIRI DEV - Full-Stack Developer Portfolio'
const defaultDescription = 'Full-stack developer specializing in modern web technologies. View my projects, skills, and experience in React, Next.js, TypeScript, and more.'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  noIndex?: boolean
  canonical?: string
}

export function generateMetadata({
  title,
  description = defaultDescription,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'SIRI DEV',
  section,
  tags = [],
  noIndex = false,
  canonical,
}: SEOProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const ogImage = image || `${siteUrl}/api/og${title ? `?title=${encodeURIComponent(title)}` : ''}`
  
  const allKeywords = [
    'portfolio',
    'full-stack developer',
    'React',
    'Next.js',
    'TypeScript',
    'web development',
    'JavaScript',
    'Node.js',
    ...keywords,
    ...tags
  ]

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: author, url: siteUrl }],
    creator: author,
    publisher: author,
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      title: fullTitle,
      description,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
          type: 'image/png',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@siridev', // Replace with actual Twitter handle
      site: '@siridev', // Replace with actual Twitter handle
    },
    alternates: {
      canonical: canonical || fullUrl,
    },
    other: {
      'theme-color': '#3b82f6',
      'color-scheme': 'light dark',
    },
  }
}

export function generateStructuredData(type: string, data: Record<string, any>) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return JSON.stringify(baseSchema)
}

export function generatePersonSchema() {
  return generateStructuredData('Person', {
    name: 'SIRI DEV',
    url: siteUrl,
    image: `${siteUrl}/api/og?title=${encodeURIComponent('SIRI DEV')}`,
    jobTitle: 'Full-Stack Developer',
    worksFor: {
      '@type': 'Organization',
      name: 'Freelance',
    },
    sameAs: [
      'https://github.com/siridev', // Replace with actual profiles
      'https://linkedin.com/in/siridev',
      'https://twitter.com/siridev',
    ],
    knowsAbout: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'Node.js',
      'PostgreSQL',
      'Prisma',
      'Web Development',
      'Frontend Development',
      'Backend Development',
    ],
    description: defaultDescription,
  })
}

export function generateWebsiteSchema() {
  return generateStructuredData('WebSite', {
    name: siteName,
    url: siteUrl,
    description: defaultDescription,
    author: {
      '@type': 'Person',
      name: 'SIRI DEV',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/projects?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  })
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return generateStructuredData('BreadcrumbList', {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  })
}

export function generateProjectSchema(project: {
  title: string
  description: string
  slug: string
  technologies: string[]
  images?: string[]
  liveUrl?: string
  githubUrl?: string
  createdAt: Date
  updatedAt: Date
}) {
  return generateStructuredData('CreativeWork', {
    name: project.title,
    description: project.description,
    url: `${siteUrl}/projects/${project.slug}`,
    dateCreated: project.createdAt.toISOString(),
    dateModified: project.updatedAt.toISOString(),
    keywords: project.technologies.join(', '),
    creator: {
      '@type': 'Person',
      name: 'SIRI DEV',
      url: siteUrl,
    },
    ...(project.images && project.images.length > 0 && {
      image: project.images.map(img => ({
        '@type': 'ImageObject',
        url: img,
        description: `${project.title} screenshot`,
      })),
    }),
    ...(project.liveUrl && { sameAs: project.liveUrl }),
    about: project.technologies.map(tech => ({
      '@type': 'Thing',
      name: tech,
    })),
  })
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return generateStructuredData('FAQPage', {
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  })
}

// Performance and Core Web Vitals utilities
export const performanceConfig = {
  // Image optimization settings
  imageConfig: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  
  // Core Web Vitals thresholds
  webVitalsThresholds: {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    FID: { good: 100, poor: 300 },   // First Input Delay
    CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
    TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  },
}

export function getWebVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = performanceConfig.webVitalsThresholds[name as keyof typeof performanceConfig.webVitalsThresholds]
  
  if (!thresholds) return 'good'
  
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}