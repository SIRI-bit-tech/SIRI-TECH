import { Metadata } from 'next'
import PublicLayout from '@/components/layouts/PublicLayout'
import AboutContent from '@/components/sections/AboutContent'
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'About SIRI DEV - Full-Stack Developer',
  description: 'Learn about SIRI DEV, a passionate full-stack developer with expertise in React, Next.js, TypeScript, and modern web technologies. Discover my journey, skills, and experience.',
  keywords: ['about', 'full-stack developer', 'web developer', 'React developer', 'Next.js developer', 'TypeScript', 'JavaScript', 'career', 'experience', 'skills'],
  url: '/about',
  type: 'profile',
})

export default function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://siridev.com'
  
  const personSchema = generateStructuredData('Person', {
    name: 'SIRI DEV',
    jobTitle: 'Full-Stack Developer',
    description: 'Passionate full-stack developer with expertise in React, Next.js, TypeScript, and modern web technologies',
    url: `${siteUrl}/about`,
    image: `${siteUrl}/api/og?title=${encodeURIComponent('SIRI DEV')}&subtitle=${encodeURIComponent('Full-Stack Developer')}`,
    sameAs: [
      'https://github.com/siridev', // Replace with actual profiles
      'https://linkedin.com/in/siridev',
      'https://twitter.com/siridev'
    ],
    knowsAbout: [
      { '@type': 'Thing', name: 'React' },
      { '@type': 'Thing', name: 'Next.js' },
      { '@type': 'Thing', name: 'TypeScript' },
      { '@type': 'Thing', name: 'JavaScript' },
      { '@type': 'Thing', name: 'Node.js' },
      { '@type': 'Thing', name: 'PostgreSQL' },
      { '@type': 'Thing', name: 'Web Development' }
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Full-Stack Developer',
      occupationLocation: {
        '@type': 'Place',
        name: 'Remote'
      },
      skills: 'React, Next.js, TypeScript, JavaScript, Node.js, PostgreSQL, Prisma, HTML, CSS, Git'
    }
  })

  return (
    <PublicLayout>
      <AboutContent />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: personSchema
        }}
      />
    </PublicLayout>
  )
}