import { Metadata } from 'next'
import PublicLayout from '@/components/layouts/PublicLayout'
import ResumeContent from '@/components/sections/ResumeContent'
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'SIRI DEV Resume - Full-Stack Developer CV',
  description: 'View and download SIRI DEV\'s professional resume. Experienced full-stack developer with expertise in React, Next.js, TypeScript, and modern web technologies.',
  keywords: ['resume', 'CV', 'full-stack developer', 'React developer', 'Next.js developer', 'TypeScript', 'work experience', 'education', 'skills', 'download resume'],
  url: '/resume',
  type: 'website',
})

export default function ResumePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://siridev.com'
  
  const resumeSchema = generateStructuredData('Person', {
    name: 'SIRI DEV',
    jobTitle: 'Full-Stack Developer',
    description: 'Professional resume of SIRI DEV, an experienced full-stack developer',
    url: `${siteUrl}/resume`,
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'Full-Stack Web Development',
        description: 'Expertise in modern web development technologies'
      }
    ],
    knowsAbout: [
      'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 
      'PostgreSQL', 'Prisma', 'HTML', 'CSS', 'Git', 'Web Development'
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Full-Stack Developer',
      skills: 'React, Next.js, TypeScript, JavaScript, Node.js, PostgreSQL, Prisma, HTML, CSS, Git'
    }
  })

  return (
    <PublicLayout>
      <ResumeContent />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: resumeSchema
        }}
      />
    </PublicLayout>
  )
}