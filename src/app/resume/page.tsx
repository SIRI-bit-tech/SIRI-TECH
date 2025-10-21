import { Metadata } from 'next'
import PublicLayout from '@/components/layouts/PublicLayout'
import ResumeContent from '@/components/sections/ResumeContent'

export const metadata: Metadata = {
  title: 'Resume | Portfolio',
  description: 'View and download my professional resume with detailed work experience and education.',
  openGraph: {
    title: 'Resume | Portfolio',
    description: 'View and download my professional resume with detailed work experience and education.',
    type: 'website',
  },
}

export default function ResumePage() {
  return (
    <PublicLayout>
      <ResumeContent />
    </PublicLayout>
  )
}