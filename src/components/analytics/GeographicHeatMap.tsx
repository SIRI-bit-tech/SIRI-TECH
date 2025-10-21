'use client'

import { useMemo } from 'react'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import { Globe } from 'lucide-react'

interface VisitorData {
  country?: string
  city?: string
  timestamp: string
  pageUrl: string
}

interface GeographicHeatMapProps {
  data: VisitorData[]
}

interface CountryStats {
  country: string
  count: number
  percentage: number
  cities: { [city: string]: number }
}

export function GeographicHeatMap({ data }: GeographicHeatMapProps) {
  const geographicStats = useMemo(() => {
    const countryMap = new Map<string, { count: number; cities: Map<string, number> }>()
    
    data.forEach(visitor => {
      const country = visitor.country || 'Unknown'
      const city = visitor.city || 'Unknown'
      
      if (!countryMap.has(country)) {
        countryMap.set(country, { count: 0, cities: new Map() })
      }
      
      const countryData = countryMap.get(country)!
      countryData.count++
      
      const currentCityCount = countryData.cities.get(city) || 0
      countryData.cities.set(city, currentCityCount + 1)
    })
    
    const total = data.length
    const countries: CountryStats[] = Array.from(countryMap.entries())
      .map(([country, data]) => ({
        country,
        count: data.count,
        percentage: total > 0 ? (data.count / total) * 100 : 0,
        cities: Object.fromEntries(data.cities.entries())
      }))
      .sort((a, b) => b.count - a.count)
    
    return countries
  }, [data])

  const getCountryFlag = (country: string) => {
    const flagMap: { [key: string]: string } = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'United Kingdom': '🇬🇧',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Japan': '🇯🇵',
      'Australia': '🇦🇺',
      'Brazil': '🇧🇷',
      'India': '🇮🇳',
      'China': '🇨🇳',
      'Russia': '🇷🇺',
      'South Korea': '🇰🇷',
      'Netherlands': '🇳🇱',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Finland': '🇫🇮',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Mexico': '🇲🇽',
      'Argentina': '🇦🇷',
      'Chile': '🇨🇱',
      'South Africa': '🇿🇦',
      'Egypt': '🇪🇬',
      'Turkey': '🇹🇷',
      'Israel': '🇮🇱',
      'Saudi Arabia': '🇸🇦',
      'UAE': '🇦🇪',
      'Singapore': '🇸🇬',
      'Thailand': '🇹🇭',
      'Vietnam': '🇻🇳',
      'Philippines': '🇵🇭',
      'Indonesia': '🇮🇩',
      'Malaysia': '🇲🇾',
      'New Zealand': '🇳🇿'
    }
    return flagMap[country] || '🌍'
  }

  const getIntensityColor = (percentage: number) => {
    if (percentage >= 20) return 'bg-purple-600'
    if (percentage >= 15) return 'bg-purple-500'
    if (percentage >= 10) return 'bg-purple-400'
    if (percentage >= 5) return 'bg-purple-300'
    if (percentage >= 2) return 'bg-purple-200'
    return 'bg-purple-100'
  }

  const getIntensityOpacity = (percentage: number) => {
    if (percentage >= 20) return 'opacity-100'
    if (percentage >= 15) return 'opacity-90'
    if (percentage >= 10) return 'opacity-80'
    if (percentage >= 5) return 'opacity-70'
    if (percentage >= 2) return 'opacity-60'
    return 'opacity-50'
  }

  const totalVisitors = data.length

  return (
    <GlassmorphismCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Geographic Distribution</h3>
          <p className="text-slate-400 text-sm">
            {totalVisitors.toLocaleString()} visitors from {geographicStats.length} countries
          </p>
        </div>
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <Globe size={20} className="text-blue-400" />
        </div>
      </div>

      {geographicStats.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">No geographic data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Countries */}
          <div className="space-y-3">
            {geographicStats.slice(0, 8).map((country, index) => (
              <div key={country.country} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getCountryFlag(country.country)}</span>
                    <div>
                      <span className="text-sm font-medium text-white">
                        {country.country}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-slate-400">
                          {country.count} visitors
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400">
                          {country.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      {country.count}
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getIntensityColor(country.percentage)} ${getIntensityOpacity(country.percentage)}`}
                    style={{ width: `${Math.max(country.percentage, 2)}%` }}
                  />
                </div>

                {/* Top cities for this country */}
                {Object.keys(country.cities).length > 1 && (
                  <div className="ml-8 space-y-1">
                    {Object.entries(country.cities)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([city, count]) => (
                        <div key={city} className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{city}</span>
                          <span className="text-slate-500">{count}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">
                  {geographicStats.length}
                </div>
                <div className="text-xs text-slate-400">Countries</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {geographicStats.reduce((sum, country) => 
                    sum + Object.keys(country.cities).length, 0
                  )}
                </div>
                <div className="text-xs text-slate-400">Cities</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="text-xs text-slate-400 mb-2">Visitor Intensity</div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Low</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-purple-100 opacity-50 rounded-sm" />
                <div className="w-3 h-3 bg-purple-200 opacity-60 rounded-sm" />
                <div className="w-3 h-3 bg-purple-300 opacity-70 rounded-sm" />
                <div className="w-3 h-3 bg-purple-400 opacity-80 rounded-sm" />
                <div className="w-3 h-3 bg-purple-500 opacity-90 rounded-sm" />
                <div className="w-3 h-3 bg-purple-600 opacity-100 rounded-sm" />
              </div>
              <span className="text-xs text-slate-500">High</span>
            </div>
          </div>
        </div>
      )}
    </GlassmorphismCard>
  )
}