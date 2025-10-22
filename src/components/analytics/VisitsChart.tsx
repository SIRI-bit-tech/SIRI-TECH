'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import { TrendingUp } from 'lucide-react'

interface VisitsData {
  date: string
  views: number
}

interface VisitsChartProps {
  data: VisitsData[]
}

export function VisitsChart({ data }: VisitsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = containerRect.width - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    if (width <= 0 || height <= 0) return

    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Parse dates and sort data
    const parseDate = d3.timeParse('%Y-%m-%d')
    const processedData = data
      .map(d => ({
        date: parseDate(d.date) || new Date(),
        views: d.views
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(processedData, d => d.date) as [Date, Date])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.views) || 0])
      .nice()
      .range([height, 0])

    // Create gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0)

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#8b5cf6')
      .attr('stop-opacity', 0.1)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8b5cf6')
      .attr('stop-opacity', 0.4)

    // Line generator
    const line = d3.line<{ date: Date; views: number }>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.views))
      .curve(d3.curveCardinal)

    // Area generator
    const area = d3.area<{ date: Date; views: number }>()
      .x(d => xScale(d.date))
      .y0(height)
      .y1(d => yScale(d.views))
      .curve(d3.curveCardinal)

    // Add area
    g.append('path')
      .datum(processedData)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area)

    // Add line
    g.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', '#8b5cf6')
      .attr('stroke-width', 2)
      .attr('d', line)

    // Add dots
    g.selectAll('.dot')
      .data(processedData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.views))
      .attr('r', 4)
      .attr('fill', '#8b5cf6')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)

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

    // Add hover interactions
    g.selectAll('.dot')
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6)
          .attr('fill', '#a855f7')

        tooltip
          .style('visibility', 'visible')
          .html(`
            <div>
              <div style="font-weight: 600;">${d.views} views</div>
              <div style="color: #94a3b8; font-size: 11px;">
                ${d.date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
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
          .attr('r', 4)
          .attr('fill', '#8b5cf6')

        tooltip.style('visibility', 'hidden')
      })

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%m/%d') as any)
        .ticks(Math.min(processedData.length, 8))
      )
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '12px')

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d3.format('d'))
      )
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '12px')

    // Style axis lines
    g.selectAll('.domain')
      .style('stroke', '#475569')
      .style('stroke-width', 1)

    g.selectAll('.tick line')
      .style('stroke', '#334155')
      .style('stroke-width', 1)

    // Cleanup tooltip on unmount
    return () => {
      d3.select('body').selectAll('.tooltip').remove()
    }
  }, [data])

  const totalViews = data.reduce((sum, d) => sum + d.views, 0)
  const avgViews = data.length > 0 ? Math.round(totalViews / data.length) : 0

  return (
    <GlassmorphismCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Visits Over Time</h3>
          <p className="text-slate-400 text-sm">
            {totalViews.toLocaleString()} total views • {avgViews} avg/day
          </p>
        </div>
        <div className="p-2 bg-purple-600/20 rounded-lg">
          <TrendingUp size={20} className="text-purple-400" />
        </div>
      </div>

      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full" />
      </div>

      {data.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">No visit data available</p>
        </div>
      )}
    </GlassmorphismCard>
  )
}