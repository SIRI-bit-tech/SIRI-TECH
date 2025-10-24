'use client'

import { useState, useEffect } from 'react'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import { 
  Activity, 
  Eye, 
  Clock, 
  MapPin,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'

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

interface RealTimeActivityProps {
  data: RealTimeData
}

export function RealTimeActivity({ data }: RealTimeActivityProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getDeviceIcon = (device: string) => {
    const deviceType = device.toLowerCase()
    if (deviceType.includes('mobile') || deviceType.includes('phone')) {
      return <Smartphone size={14} className="text-green-400" />
    }
    if (deviceType.includes('tablet') || deviceType.includes('ipad')) {
      return <Tablet size={14} className="text-blue-400" />
    }
    return <Monitor size={14} className="text-purple-400" />
  }

  const getTimeAgo = (timestamp: string) => {
    const now = currentTime.getTime()
    const activityTime = new Date(timestamp).getTime()
    const diffInSeconds = Math.floor((now - activityTime) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }
  }

  const getPageDisplayName = (url: string, title?: string) => {
    if (title) return title
    if (url === '/') return 'Home'
    if (url.startsWith('/projects/')) return 'Project Details'
    if (url === '/projects') return 'Projects'
    if (url === '/about') return 'About'
    if (url === '/contact') return 'Contact'
    if (url === '/resume') return 'Resume'
    return url.replace(/^\//, '').replace(/\//g, ' › ') || 'Unknown Page'
  }

  const getLocationDisplay = (country?: string, city?: string) => {
    if (country && city) {
      return `${city}, ${country}`
    }
    if (country) {
      return country
    }
    return 'Unknown Location'
  }

  const getBrowserShortName = (browser: string) => {
    if (browser.toLowerCase().includes('chrome')) return 'Chrome'
    if (browser.toLowerCase().includes('firefox')) return 'Firefox'
    if (browser.toLowerCase().includes('safari')) return 'Safari'
    if (browser.toLowerCase().includes('edge')) return 'Edge'
    if (browser.toLowerCase().includes('opera')) return 'Opera'
    return browser.split(' ')[0] || 'Unknown'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Real-time Stats */}
      <GlassmorphismCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Real-time Overview</h3>
            <p className="text-slate-400 text-sm">Live activity on your portfolio</p>
          </div>
          <div className="p-2 bg-green-600/20 rounded-lg">
            <Activity size={20} className="text-green-400" />
          </div>
        </div>

        <div className="space-y-6">
          {/* Active Sessions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Eye size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Now</p>
                <p className="text-xl font-bold text-white">{data.activeSessions}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>

          {/* Recent Views */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Last 24 Hours</p>
                <p className="text-xl font-bold text-white">{data.recentViews}</p>
              </div>
            </div>
          </div>

          {/* Update Time */}
          <div className="pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-500">
              Last updated: {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </GlassmorphismCard>

      {/* Recent Activity Feed */}
      <div className="lg:col-span-2">
        <GlassmorphismCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Recent Activity</h3>
              <p className="text-slate-400 text-sm">
                Latest {data.recentActivity.length} page views
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live Feed</span>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.recentActivity.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-slate-400">No recent activity</p>
              </div>
            ) : (
              data.recentActivity.map((activity, index) => (
                <div 
                  key={`${activity.timestamp}-${index}`}
                  className="flex items-start space-x-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getDeviceIcon(activity.device)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {getPageDisplayName(activity.pageUrl, activity.pageTitle)}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {activity.pageUrl}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                      <div className="flex items-center space-x-1">
                        <MapPin size={12} />
                        <span className="truncate max-w-24">
                          {getLocationDisplay(activity.country, activity.city)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>•</span>
                        <span className="truncate max-w-20">
                          {getBrowserShortName(activity.browser)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {data.recentActivity.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
              <p className="text-xs text-slate-500">
                Showing last {data.recentActivity.length} activities • Updates every 30 seconds
              </p>
            </div>
          )}
        </GlassmorphismCard>
      </div>
    </div>
  )
}