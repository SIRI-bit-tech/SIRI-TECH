import PublicLayout from '@/components/layouts/PublicLayout'
import { ProjectsPageSkeleton } from '@/components/ui/PageSkeletons'

export default function ProjectsLoading() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <ProjectsPageSkeleton />
      </div>
    </PublicLayout>
  )
}