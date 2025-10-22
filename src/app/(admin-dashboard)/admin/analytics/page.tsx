import { Suspense } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Track your portfolio performance and visitor insights</p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <AnalyticsDashboard />
        </Suspense>
      </div>
    </AdminLayout>
  )
}