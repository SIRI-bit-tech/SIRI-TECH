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
  RefreshCw,
  Filter,
  Settings,
  Clock,
  Activity,
  Database,
  Trash2,
  AlertTriangle
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
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: string
    endDate: string
  }>({
    startDate: '',
    endDate: ''
  })
  const [useCustomRange, setUseCustomRange] = useState(false)
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds
  const [filters, setFilters] = useState({
    country: '',
    device: '',
    browser: '',
    page: ''
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null)
  const [showPerformancePanel, setShowPerformancePanel] = useState(false)
  const [showCleanupPanel, setShowCleanupPanel] = useState(false)
  const [cleanupStatus, setCleanupStatus] = useState<any>(null)

  const fetchAnalyticsData = async (days?: number) => {
    try {
      setRefreshing(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      
      if (useCustomRange && customDateRange.startDate && customDateRange.endDate) {
        params.append('startDate', customDateRange.startDate)
        params.append('endDate', customDateRange.endDate)
      } else {
        params.append('days', String(days || dateRange))
      }

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })

      const [analyticsResponse, realTimeResponse] = await Promise.all([
        fetch(`/api/analytics/data?${params.toString()}`),
        realTimeEnabled ? fetch('/api/analytics/realtime') : Promise.resolve({ ok: true, json: () => ({ success: true, data: null }) })
      ])

      if (!analyticsResponse.ok || !realTimeResponse.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const analyticsResult = await analyticsResponse.json()
      const realTimeResult = await realTimeResponse.json()

      if (analyticsResult.success && realTimeResult.success) {
        setAnalyticsData(analyticsResult.data)
        if (realTimeEnabled) {
          setRealTimeData(realTimeResult.data)
        }
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

  // Auto-refresh real-time data with configurable interval
  useEffect(() => {
    if (!realTimeEnabled) return

    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        fetchAnalyticsData()
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [dateRange, loading, refreshing, realTimeEnabled, refreshInterval, useCustomRange, customDateRange, filters])

  const handleRefresh = () => {
    fetchAnalyticsData(dateRange)
  }

  const handleDateRangeChange = (days: number) => {
    setDateRange(days)
    setUseCustomRange(false) // Reset custom range when using preset
  }

  const handleExportData = async (format: 'csv' | 'json' = 'csv') => {
    try {
      // Build export parameters
      const params = new URLSearchParams()
      params.append('format', format)
      
      if (useCustomRange && customDateRange.startDate && customDateRange.endDate) {
        params.append('startDate', customDateRange.startDate)
        params.append('endDate', customDateRange.endDate)
      } else {
        params.append('days', String(dateRange))
      }

      // Add filters to export
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/analytics/export?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        const dateStr = useCustomRange && customDateRange.startDate && customDateRange.endDate
          ? `${customDateRange.startDate}-to-${customDateRange.endDate}`
          : `${dateRange}days-${new Date().toISOString().split('T')[0]}`
        
        a.download = `analytics-${dateStr}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      setError('Failed to export data. Please try again.')
    }
  }

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch(`/api/analytics/performance?days=${dateRange}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setPerformanceMetrics(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error)
    }
  }

  const fetchCleanupStatus = async () => {
    try {
      const response = await fetch('/api/analytics/cleanup')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCleanupStatus(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch cleanup status:', error)
    }
  }

  const handleCleanup = async (retentionDays: number, options: any = {}) => {
    try {
      const response = await fetch('/api/analytics/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionDays, ...options })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCleanupStatus(result.data)
          // Refresh analytics data after cleanup
          fetchAnalyticsData()
        }
      }
    } catch (error) {
      console.error('Failed to perform cleanup:', error)
      setError('Failed to perform cleanup. Please try again.')
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
      <GlassmorphismCard className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Main Controls Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar size={20} className="text-slate-400" />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={useCustomRange}
                    onChange={(e) => setUseCustomRange(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-300">Custom Range</span>
                </label>
              </div>

              {useCustomRange ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ) : (
                <select
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(Number(e.target.value))}
                  className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={1}>Last 24 hours</option>
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last year</option>
                </select>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Filter size={16} />
                <span>Filters</span>
              </Button>
              <Button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                variant={realTimeEnabled ? "primary" : "outline"}
                className="flex items-center space-x-2"
              >
                <Clock size={16} />
                <span>Real-time</span>
              </Button>
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </Button>
              <div className="relative">
                <Button
                  onClick={() => handleExportData('csv')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Export CSV</span>
                </Button>
              </div>
              <Button
                onClick={() => handleExportData('json')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export JSON</span>
              </Button>
              <Button
                onClick={() => {
                  setShowPerformancePanel(!showPerformancePanel)
                  if (!showPerformancePanel) fetchPerformanceMetrics()
                }}
                variant={showPerformancePanel ? "primary" : "outline"}
                className="flex items-center space-x-2"
              >
                <Activity size={16} />
                <span>Performance</span>
              </Button>
              <Button
                onClick={() => {
                  setShowCleanupPanel(!showCleanupPanel)
                  if (!showCleanupPanel) fetchCleanupStatus()
                }}
                variant={showCleanupPanel ? "primary" : "outline"}
                className="flex items-center space-x-2"
              >
                <Database size={16} />
                <span>Cleanup</span>
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t border-slate-600 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="Filter by country"
                    value={filters.country}
                    onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Device</label>
                  <select
                    value={filters.device}
                    onChange={(e) => setFilters(prev => ({ ...prev, device: e.target.value }))}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All devices</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Browser</label>
                  <input
                    type="text"
                    placeholder="Filter by browser"
                    value={filters.browser}
                    onChange={(e) => setFilters(prev => ({ ...prev, browser: e.target.value }))}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Page</label>
                  <input
                    type="text"
                    placeholder="Filter by page URL"
                    value={filters.page}
                    onChange={(e) => setFilters(prev => ({ ...prev, page: e.target.value }))}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              {realTimeEnabled && (
                <div className="mt-4 flex items-center space-x-4">
                  <label className="text-sm font-medium text-slate-300">Refresh Interval:</label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={10000}>10 seconds</option>
                    <option value={30000}>30 seconds</option>
                    <option value={60000}>1 minute</option>
                    <option value={300000}>5 minutes</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassmorphismCard>

      {/* Performance Metrics Panel */}
      {showPerformancePanel && (
        <GlassmorphismCard className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Activity size={20} className="text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
          </div>
          
          {performanceMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-3">
                <div className="text-sm text-slate-400">Query Response Time</div>
                <div className="text-xl font-bold text-white">
                  {performanceMetrics.performanceMetrics?.avgResponseTime || 0}ms
                </div>
                <div className={`text-xs ${
                  (performanceMetrics.performanceMetrics?.avgResponseTime || 0) < 100 
                    ? 'text-green-400' 
                    : (performanceMetrics.performanceMetrics?.avgResponseTime || 0) < 500 
                    ? 'text-yellow-400' 
                    : 'text-red-400'
                }`}>
                  {(performanceMetrics.performanceMetrics?.avgResponseTime || 0) < 100 
                    ? 'Excellent' 
                    : (performanceMetrics.performanceMetrics?.avgResponseTime || 0) < 500 
                    ? 'Good' 
                    : 'Needs Optimization'}
                </div>
              </div>
              
              <div className="bg-slate-800/30 rounded-lg p-3">
                <div className="text-sm text-slate-400">Total Records</div>
                <div className="text-xl font-bold text-white">
                  {performanceMetrics.performanceMetrics?.totalRecords?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-slate-400">
                  {performanceMetrics.performanceMetrics?.estimatedDataSizeKB || 0} KB
                </div>
              </div>
              
              <div className="bg-slate-800/30 rounded-lg p-3">
                <div className="text-sm text-slate-400">Peak Hour</div>
                <div className="text-xl font-bold text-white">
                  {performanceMetrics.performanceMetrics?.peakHour?.hour || 0}:00
                </div>
                <div className="text-xs text-slate-400">
                  {performanceMetrics.performanceMetrics?.peakHour?.count || 0} requests
                </div>
              </div>
              
              <div className="bg-slate-800/30 rounded-lg p-3">
                <div className="text-sm text-slate-400">Index Usage</div>
                <div className="text-xl font-bold text-white">
                  {performanceMetrics.indexUsage?.length || 0}
                </div>
                <div className="text-xs text-green-400">Active Indexes</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-slate-400">Loading performance metrics...</span>
            </div>
          )}
          
          {performanceMetrics?.optimizationRecommendations?.length > 0 && (
            <div className="mt-4 border-t border-slate-600 pt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Optimization Recommendations</h4>
              <div className="space-y-2">
                {performanceMetrics.optimizationRecommendations.map((rec: any, index: number) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <AlertTriangle size={14} className={`mt-0.5 ${
                      rec.priority === 'high' ? 'text-red-400' : 
                      rec.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                    }`} />
                    <div>
                      <div className="text-white font-medium">{rec.issue}</div>
                      <div className="text-slate-400">{rec.recommendation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassmorphismCard>
      )}

      {/* Cleanup Panel */}
      {showCleanupPanel && (
        <GlassmorphismCard className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Database size={20} className="text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Data Management & Cleanup</h3>
          </div>
          
          {cleanupStatus ? (
            <div className="space-y-4">
              {/* Current Data Size */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <div className="text-sm text-slate-400">Analytics Records</div>
                  <div className="text-xl font-bold text-white">
                    {cleanupStatus.currentSize?.analytics?.count?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-slate-400">
                    {cleanupStatus.currentSize?.analytics?.sizeKB || 0} KB
                  </div>
                </div>
                
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <div className="text-sm text-slate-400">Page Views</div>
                  <div className="text-xl font-bold text-white">
                    {cleanupStatus.currentSize?.pageViews?.count?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-slate-400">
                    {cleanupStatus.currentSize?.pageViews?.sizeKB || 0} KB
                  </div>
                </div>
                
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <div className="text-sm text-slate-400">Total Size</div>
                  <div className="text-xl font-bold text-white">
                    {cleanupStatus.currentSize?.totalSize || 0} KB
                  </div>
                  <div className="text-xs text-slate-400">
                    {((cleanupStatus.currentSize?.totalSize || 0) / 1024).toFixed(1)} MB
                  </div>
                </div>
              </div>
              
              {/* Cleanup Recommendations */}
              {cleanupStatus.recommendations?.length > 0 && (
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Cleanup Recommendations</h4>
                  <div className="space-y-2">
                    {cleanupStatus.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <AlertTriangle size={14} className={`mt-0.5 ${
                          rec.type === 'urgent' ? 'text-red-400' : 
                          rec.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                        <div>
                          <div className="text-white">{rec.message}</div>
                          {rec.retentionDays && (
                            <Button
                              onClick={() => handleCleanup(rec.retentionDays)}
                              variant="outline"
                              className="mt-1 text-xs py-1 px-2"
                            >
                              Clean up data older than {rec.retentionDays} days
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Manual Cleanup Controls */}
              <div className="border-t border-slate-600 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Manual Cleanup</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleCleanup(90)}
                    variant="outline"
                    className="text-xs"
                  >
                    <Trash2 size={12} className="mr-1" />
                    Clean 90+ days
                  </Button>
                  <Button
                    onClick={() => handleCleanup(180)}
                    variant="outline"
                    className="text-xs"
                  >
                    <Trash2 size={12} className="mr-1" />
                    Clean 180+ days
                  </Button>
                  <Button
                    onClick={() => handleCleanup(365)}
                    variant="outline"
                    className="text-xs"
                  >
                    <Trash2 size={12} className="mr-1" />
                    Clean 1+ year
                  </Button>
                  <Button
                    onClick={() => handleCleanup(365, { aggressive: true, compactData: true })}
                    variant="outline"
                    className="text-xs"
                  >
                    <Settings size={12} className="mr-1" />
                    Deep Clean
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-slate-400">Loading cleanup status...</span>
            </div>
          )}
        </GlassmorphismCard>
      )}

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