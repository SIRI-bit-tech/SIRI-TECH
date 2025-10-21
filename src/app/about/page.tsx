import { Metadata } from 'next'
import PublicLayout from '@/components/layouts/PublicLayout'
import AboutContent from '@/components/sections/AboutContent'

export const metadata: Metadata = {
  title: 'About | Portfolio',
  description: 'Learn more about my background, skills, and experience as a web developer.',
  openGraph: {
    title: 'About | Portfolio',
    description: 'Learn more about my background, skills, and experience as a web developer.',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <PublicLayout>
      <AboutContent />
    </PublicLayout>
  )
}