'use client'

import SkeletonLoader, { 
  TextSkeleton, 
  CardSkeleton, 
  ImageSkeleton, 
  ButtonSkeleton,
  AvatarSkeleton 
} from './SkeletonLoader'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'

// Home page skeleton
export function HomePageSkeleton() {
  return (
    <div className="space-y-16">
      {/* Hero Section Skeleton */}
      <section className="text-center space-y-6 py-20">
        <SkeletonLoader variant="text" width="60%" height={48} className="mx-auto" />
        <SkeletonLoader variant="text" width="40%" height={24} className="mx-auto" />
        <TextSkeleton lines={2} className="max-w-2xl mx-auto" />
        <div className="flex justify-center gap-4 mt-8">
          <ButtonSkeleton width={120} />
          <ButtonSkeleton width={100} />
        </div>
      </section>

      {/* Skills Section Skeleton */}
      <section className="space-y-8">
        <SkeletonLoader variant="text" width="30%" height={32} className="mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <GlassmorphismCard key={i} variant="light" className="p-4">
              <SkeletonLoader variant="text" width="80%" height={20} className="mx-auto" />
            </GlassmorphismCard>
          ))}
        </div>
      </section>

      {/* Featured Projects Skeleton */}
      <section className="space-y-8">
        <SkeletonLoader variant="text" width="40%" height={32} className="mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <GlassmorphismCard key={i} variant="medium" className="p-6 space-y-4">
              <ImageSkeleton />
              <SkeletonLoader variant="text" width="75%" height={24} />
              <TextSkeleton lines={2} />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <SkeletonLoader key={j} variant="button" width={60} height={24} />
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <ButtonSkeleton width={80} />
                <ButtonSkeleton width={70} />
              </div>
            </GlassmorphismCard>
          ))}
        </div>
      </section>
    </div>
  )
}

// Projects page skeleton
export function ProjectsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <SkeletonLoader variant="text" width="30%" height={40} className="mx-auto" />
        <TextSkeleton lines={1} className="max-w-xl mx-auto" />
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ButtonSkeleton key={i} width={80} height={36} />
        ))}
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <GlassmorphismCard key={i} variant="medium" className="p-6 space-y-4">
            <ImageSkeleton />
            <SkeletonLoader variant="text" width="85%" height={24} />
            <TextSkeleton lines={2} />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <SkeletonLoader key={j} variant="button" width={60} height={24} />
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <ButtonSkeleton width={90} />
              <ButtonSkeleton width={80} />
            </div>
          </GlassmorphismCard>
        ))}
      </div>
    </div>
  )
}

// About page skeleton
export function AboutPageSkeleton() {
  return (
    <div className="space-y-12">
      {/* Profile section */}
      <GlassmorphismCard variant="medium" className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <SkeletonLoader variant="custom" width={200} height={200} rounded className="mx-auto md:mx-0" />
          </div>
          <div className="flex-1 space-y-4">
            <SkeletonLoader variant="text" width="50%" height={32} />
            <SkeletonLoader variant="text" width="40%" height={20} />
            <TextSkeleton lines={4} />
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonLoader key={i} variant="avatar" />
              ))}
            </div>
          </div>
        </div>
      </GlassmorphismCard>

      {/* Skills section */}
      <GlassmorphismCard variant="medium" className="p-8 space-y-6">
        <SkeletonLoader variant="text" width="20%" height={28} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <SkeletonLoader key={i} variant="button" height={40} />
          ))}
        </div>
      </GlassmorphismCard>

      {/* Experience section */}
      <GlassmorphismCard variant="medium" className="p-8 space-y-6">
        <SkeletonLoader variant="text" width="25%" height={28} />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-l-2 border-gray-200 dark:border-gray-700 pl-6 space-y-2">
              <SkeletonLoader variant="text" width="60%" height={20} />
              <SkeletonLoader variant="text" width="40%" height={16} />
              <SkeletonLoader variant="text" width="30%" height={14} />
              <TextSkeleton lines={2} />
            </div>
          ))}
        </div>
      </GlassmorphismCard>
    </div>
  )
}

// Contact page skeleton
export function ContactPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <SkeletonLoader variant="text" width="40%" height={40} className="mx-auto" />
        <TextSkeleton lines={2} className="max-w-lg mx-auto" />
      </div>

      {/* Contact form */}
      <GlassmorphismCard variant="medium" className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <SkeletonLoader variant="text" width="20%" height={16} />
            <SkeletonLoader variant="button" height={44} />
          </div>
          <div className="space-y-2">
            <SkeletonLoader variant="text" width="20%" height={16} />
            <SkeletonLoader variant="button" height={44} />
          </div>
        </div>
        
        <div className="space-y-2">
          <SkeletonLoader variant="text" width="25%" height={16} />
          <SkeletonLoader variant="button" height={44} />
        </div>
        
        <div className="space-y-2">
          <SkeletonLoader variant="text" width="20%" height={16} />
          <SkeletonLoader variant="custom" height={120} rounded />
        </div>
        
        <ButtonSkeleton width={120} height={44} />
      </GlassmorphismCard>

      {/* Contact info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <GlassmorphismCard key={i} variant="light" className="p-6 text-center space-y-3">
            <SkeletonLoader variant="custom" width={48} height={48} rounded className="mx-auto" />
            <SkeletonLoader variant="text" width="60%" height={20} className="mx-auto" />
            <SkeletonLoader variant="text" width="80%" height={16} className="mx-auto" />
          </GlassmorphismCard>
        ))}
      </div>
    </div>
  )
}

// Admin dashboard skeleton
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassmorphismCard key={i} variant="medium" className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <SkeletonLoader variant="text" width="60%" height={16} />
              <SkeletonLoader variant="custom" width={24} height={24} rounded />
            </div>
            <SkeletonLoader variant="text" width="40%" height={32} />
            <SkeletonLoader variant="text" width="80%" height={14} />
          </GlassmorphismCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassmorphismCard variant="medium" className="p-6 space-y-4">
          <SkeletonLoader variant="text" width="40%" height={24} />
          <SkeletonLoader variant="custom" height={300} rounded />
        </GlassmorphismCard>
        
        <GlassmorphismCard variant="medium" className="p-6 space-y-4">
          <SkeletonLoader variant="text" width="35%" height={24} />
          <SkeletonLoader variant="custom" height={300} rounded />
        </GlassmorphismCard>
      </div>

      {/* Recent activity */}
      <GlassmorphismCard variant="medium" className="p-6 space-y-4">
        <SkeletonLoader variant="text" width="30%" height={24} />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded">
              <AvatarSkeleton />
              <div className="flex-1 space-y-1">
                <SkeletonLoader variant="text" width="70%" height={16} />
                <SkeletonLoader variant="text" width="40%" height={14} />
              </div>
              <SkeletonLoader variant="text" width="15%" height={14} />
            </div>
          ))}
        </div>
      </GlassmorphismCard>
    </div>
  )
}

// Project detail skeleton
export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <SkeletonLoader variant="text" width="60%" height={40} />
        <TextSkeleton lines={2} className="max-w-3xl" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonLoader key={i} variant="button" width={80} height={28} />
          ))}
        </div>
      </div>

      {/* Image gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageSkeleton className="md:col-span-2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <ImageSkeleton key={i} />
        ))}
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GlassmorphismCard variant="medium" className="p-6 space-y-4">
            <SkeletonLoader variant="text" width="30%" height={24} />
            <TextSkeleton lines={6} />
          </GlassmorphismCard>
          
          <GlassmorphismCard variant="medium" className="p-6 space-y-4">
            <SkeletonLoader variant="text" width="25%" height={24} />
            <TextSkeleton lines={4} />
          </GlassmorphismCard>
        </div>
        
        <div className="space-y-6">
          <GlassmorphismCard variant="medium" className="p-6 space-y-4">
            <SkeletonLoader variant="text" width="40%" height={20} />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <SkeletonLoader variant="text" width="40%" height={16} />
                  <SkeletonLoader variant="text" width="30%" height={16} />
                </div>
              ))}
            </div>
          </GlassmorphismCard>
          
          <div className="space-y-3">
            <ButtonSkeleton height={44} />
            <ButtonSkeleton height={44} />
          </div>
        </div>
      </div>
    </div>
  )
}