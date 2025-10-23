import PublicLayout from '@/components/layouts/PublicLayout'
import { HomePageSkeleton } from '@/components/ui/PageSkeletons'

export default function HomeLoading() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <HomePageSkeleton />
      </div>
    </PublicLayout>
  )
}