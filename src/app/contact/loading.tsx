import PublicLayout from '@/components/layouts/PublicLayout'
import { ContactPageSkeleton } from '@/components/ui/PageSkeletons'

export default function ContactLoading() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <ContactPageSkeleton />
      </div>
    </PublicLayout>
  )
}