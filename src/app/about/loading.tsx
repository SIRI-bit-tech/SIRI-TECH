import PublicLayout from '@/components/layouts/PublicLayout'
import { AboutPageSkeleton } from '@/components/ui/PageSkeletons'

export default function AboutLoading() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <AboutPageSkeleton />
      </div>
    </PublicLayout>
  )
}