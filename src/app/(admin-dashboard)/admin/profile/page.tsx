import { Suspense } from 'react'
import { ProfileManagement } from '@/components/admin/ProfileManagement'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Management</h1>
        <p className="text-slate-400">Manage your personal information, skills, and resume</p>
      </div>

      <Suspense fallback={
        <GlassmorphismCard className="p-8">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </GlassmorphismCard>
      }>
        <ProfileManagement />
      </Suspense>
    </div>
  )
}