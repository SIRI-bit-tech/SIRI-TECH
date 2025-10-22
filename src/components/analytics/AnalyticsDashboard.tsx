'use client'

import { useState, useEffect } from 'react'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { AnalyticsOverview } from './AnalyticsOverview'
import { VisitsChart } from './VisitsChart'
import { PageViewsChart } from './PageViewsChart'
import { TrafficSourcesChart } from './TrafficSourcesChart'
import { DeviceBreakdownChart } from './DeviceBreakdownChart'
import { GeographicHeatMap } from './GeographicHeatMap'
import { RealTimeActivity } from './RealTimeActivity'
import { 
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import Button from '@/components/ui/Button'

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

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState(30)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalyticsData = async (days: number = 30) => {
    try {
      setRefreshing(true)
      setError(null)

      const [analyticsResponse, realTimeResponse] = await Promise.all([
        fetch(`/api/analytics/data?days=${days}`),
        fetch('/api/analytics/realtime')
      ])

      if (!analyticsResponse.ok || !realTimeResponse.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const analyticsResult = await analyticsResponse.json()
      const realTimeResult = await realTimeResponse.json()

      if (analyticsResult.success && realTimeResult.success) {
        setAnalyticsData(analyticsResult.data)
        setRealTimeData(realTimeResult.data)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData(dateRange)
  }, [dateRange])

  // Auto-refresh real-time data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        fetchAnalyticsData(dateRange)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [dateRange, loading, refreshing])

  const handleRefresh = () => {
    fetchAnalyticsData(dateRange)
  }

  const handleDateRangeChange = (days: number) => {
    setDateRange(days)
  }

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/analytics/export?days=${dateRange}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${dateRange}days-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <GlassmorphismCard className="p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          Try Again
        </Button>
      </GlassmorphismCard>
    )
  }

  if (!analyticsData || !realTimeData) {
    return (
      <GlassmorphismCard className="p-8 text-center">
        <p className="text-slate-400">No analytics data available</p>
      </GlassmorphismCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Calendar size={20} className="text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(Number(e.target.value))}
            className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={handleExportData}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <AnalyticsOverview 
        data={analyticsData}
        realTimeData={realTimeData}
        dateRange={dateRange}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Visits Over Time */}
        <div className="xl:col-span-2">
          <VisitsChart data={analyticsData.dailyViews} />
        </div>

        {/* Page Views */}
        <PageViewsChart data={analyticsData.topPages} />

        {/* Traffic Sources */}
        <TrafficSourcesChart data={analyticsData.browserStats} />

        {/* Device Breakdown */}
        <DeviceBreakdownChart data={analyticsData.deviceStats} />

        {/* Geographic Heat Map */}
        <GeographicHeatMap data={analyticsData.recentVisitors} />
      </div>

      {/* Real-time Activity */}
      <RealTimeActivity data={realTimeData} />
    </div>
  )
}