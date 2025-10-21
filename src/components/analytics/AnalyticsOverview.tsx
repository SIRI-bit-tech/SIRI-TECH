'use client'

import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import { 
  Eye, 
  Users, 
  Clock, 
  TrendingUp,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  uniqueVisitors: number
  topPages: Array<{ url: string; views: number }>
  recentVisitors: Array<{
    country?: string
    city?: string
    timestamp: string
    pageUrl: string
  }>
  deviceStats: Array<{ device: string; count: number }>
  browserStats: Array<{ browser: string; count: number }>
  dailyViews: Array<{ date: string; views: number }>
}

interface RealTimeData {
  activeSessions: number
  recentViews: number
  recentActivity: Array<{
    pageUrl: string
    pageTitle?: string
    country?: string
    city?: string
    device: string
    browser: string
    timestamp: string
  }>
}

interface AnalyticsOverviewProps {
  data: AnalyticsData
  realTimeData: RealTimeData
  dateRange: number
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  isRealTime = false
}: {
  title: string
  value: number | string
  icon: any
  description?: string
  trend?: number
  isRealTime?: boolean
}) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      return val.toLocaleString()
    }
    return val
  }

  const getTrendColor = (trend?: number) => {
    if (!trend) return 'text-slate-400'
    return trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'
  }

  const getTrendIcon = (trend?: number) => {
    if (!trend) return null
    return trend > 0 ? '↗' : trend < 0 ? '↘' : '→'
  }

  return (
    <GlassmorphismCard className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            {isRealTime && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">Live</span>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{formatValue(value)}</p>
          {description && (
            <p className="text-slate-300 text-sm mt-1">{description}</p>
          )}
          {trend !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              <span className={getTrendColor(trend)}>
                {getTrendIcon(trend)} {Math.abs(trend)}%
              </span>
              <span className="text-slate-400 ml-1">vs previous period</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-purple-600/20 rounded-lg">
          <Icon size={24} className="text-purple-400" />
        </div>
      </div>
    </GlassmorphismCard>
  )
}

export function AnalyticsOverview({ data, realTimeData, dateRange }: AnalyticsOverviewProps) {
  // Calculate average pages per session
  const avgPagesPerSession = data.uniqueVisitors > 0 
    ? (data.totalViews / data.uniqueVisitors).toFixed(1)
    : '0'

  // Calculate bounce rate (simplified - sessions with only 1 page view)
  const bounceRate = data.uniqueVisitors > 0 
    ? Math.round((data.uniqueVisitors - data.totalViews + data.uniqueVisitors) / data.uniqueVisitors * 100)
    : 0

  // Get period description
  const getPeriodDescription = (days: number) => {
    if (days === 7) return 'Last 7 days'
    if (days === 30) return 'Last 30 days'
    if (days === 90) return 'Last 90 days'
    if (days === 365) return 'Last year'
    return `Last ${days} days`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <MetricCard
        title="Page Views"
        value={data.totalViews}
        icon={Eye}
        description={getPeriodDescription(dateRange)}
      />
      
      <MetricCard
        title="Unique Visitors"
        value={data.uniqueVisitors}
        icon={Users}
        description={getPeriodDescription(dateRange)}
      />
      
      <MetricCard
        title="Avg. Pages/Session"
        value={avgPagesPerSession}
        icon={Clock}
        description="Pages per visitor"
      />
      
      <MetricCard
        title="Active Now"
        value={realTimeData.activeSessions}
        icon={Activity}
        description="Live visitors"
        isRealTime={true}
      />
      
      <MetricCard
        title="Views Today"
        value={realTimeData.recentViews}
        icon={TrendingUp}
        description="Last 24 hours"
        isRealTime={true}
      />
    </div>
  )
}