'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import { PieChart } from 'lucide-react'

interface TrafficData {
  browser: string
  count: number
}

interface TrafficSourcesChartProps {
  data: TrafficData[]
}

export function TrafficSourcesChart({ data }: TrafficSourcesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const width = containerRect.width
    const height = 300
    const radius = Math.min(width, height) / 2 - 40

    if (radius <= 0) return

    svg.attr('width', width)
       .attr('height', height)

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    // Process data - combine small segments
    const total = data.reduce((sum, d) => sum + d.count, 0)
    const threshold = total * 0.03 // 3% threshold
    
    let processedData = data.slice()
    const smallSegments = processedData.filter(d => d.count < threshold)
    const largeSegments = processedData.filter(d => d.count >= threshold)
    
    if (smallSegments.length > 1) {
      const othersCount = smallSegments.reduce((sum, d) => sum + d.count, 0)
      processedData = [...largeSegments, { browser: 'Others', count: othersCount }]
    }

    // Sort by count
    processedData.sort((a, b) => b.count - a.count)

    // Color scale
    const colors = [
      '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', 
      '#ef4444', '#ec4899', '#6366f1', '#84cc16'
    ]
    
    const colorScale = d3.scaleOrdinal()
      .domain(processedData.map(d => d.browser))
      .range(colors)

    // Pie generator
    const pie = d3.pie<TrafficData>()
      .value(d => d.count)
      .sort(null)

    // Arc generator
    const arc = d3.arc<d3.PieArcDatum<TrafficData>>()
      .innerRadius(radius * 0.4)
      .outerRadius(radius)

    const outerArc = d3.arc<d3.PieArcDatum<TrafficData>>()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1)

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(15, 23, 42, 0.95)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('border', '1px solid rgba(148, 163, 184, 0.2)')
      .style('backdrop-filter', 'blur(8px)')
      .style('z-index', '1000')

    // Create arcs
    const arcs = g.selectAll('.arc')
      .data(pie(processedData))
      .enter().append('g')
      .attr('class', 'arc')

    // Add paths
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.browser) as string)
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.8)
          .attr('transform', 'scale(1.05)')

        const percentage = ((d.data.count / total) * 100).toFixed(1)
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div>
              <div style="font-weight: 600;">${d.data.browser}</div>
              <div style="color: #94a3b8; font-size: 11px;">
                ${d.data.count} visits (${percentage}%)
              </div>
            </div>
          `)
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1)
          .attr('transform', 'scale(1)')

        tooltip.style('visibility', 'hidden')
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .style('opacity', 1)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
        return function(t) {
          return arc(interpolate(t)) || ''
        }
      })

    // Add labels
    arcs.append('text')
      .attr('transform', function(d) {
        const pos = outerArc.centroid(d)
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1)
        return `translate(${pos})`
      })
      .attr('dy', '.35em')
      .style('text-anchor', function(d) {
        return midAngle(d) < Math.PI ? 'start' : 'end'
      })
      .style('fill', '#e2e8f0')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .text(function(d) {
        const percentage = ((d.data.count / total) * 100).toFixed(0)
        return Number(percentage) > 5 ? `${d.data.browser} (${percentage}%)` : ''
      })
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 400)
      .style('opacity', 1)

    // Add polylines
    arcs.append('polyline')
      .attr('points', function(d) {
        const pos = outerArc.centroid(d)
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1)
        return [arc.centroid(d), outerArc.centroid(d), pos].join(',')
      })
      .style('fill', 'none')
      .style('stroke', '#64748b')
      .style('stroke-width', 1)
      .style('opacity', function(d) {
        const percentage = ((d.data.count / total) * 100)
        return percentage > 5 ? 0.6 : 0
      })

    function midAngle(d: d3.PieArcDatum<TrafficData>) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2
    }

    // Cleanup tooltip on unmount
    return () => {
      d3.select('body').selectAll('.tooltip').remove()
    }
  }, [data])

  const totalSources = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <GlassmorphismCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Traffic Sources</h3>
          <p className="text-slate-400 text-sm">
            {totalSources.toLocaleString()} total visits by browser
          </p>
        </div>
        <div className="p-2 bg-purple-600/20 rounded-lg">
          <PieChart size={20} className="text-purple-400" />
        </div>
      </div>

      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full" />
      </div>

      {data.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">No traffic source data available</p>
        </div>
      )}

      {/* Legend */}
      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.slice(0, 6).map((item, index) => {
            const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
            return (
              <div key={item.browser} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-slate-300 truncate">
                  {item.browser}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </GlassmorphismCard>
  )
}