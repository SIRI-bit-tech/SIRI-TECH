import PublicLayout from '@/components/layouts/PublicLayout'
import { HeroSection, SkillsShowcase, FeaturedProjects } from '@/components/sections'

export default function Home() {
  return (
    <PublicLayout>
      <HeroSection />
      <SkillsShowcase />
      <FeaturedProjects />
    </PublicLayout>
  )
}
