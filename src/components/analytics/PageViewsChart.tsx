'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import { BarChart3 } from 'lucide-react'

interface PageData {
  url: string
  views: number
}

interface PageViewsChartProps {
  data: PageData[]
}

export function PageViewsChart({ data }: PageViewsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const margin = { top: 20, right: 30, bottom: 80, left: 50 }
    const width = containerRect.width - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    if (width <= 0 || height <= 0) return

    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Process data - take top 10 pages and format URLs
    const processedData = data
      .slice(0, 10)
      .map(d => ({
        ...d,
        shortUrl: d.url === '/' ? 'Home' : 
                  d.url.length > 20 ? d.url.substring(0, 20) + '...' : d.url
      }))

    // Scales
    const xScale = d3.scaleBand()
      .domain(processedData.map(d => d.shortUrl))
      .range([0, width])
      .padding(0.2)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.views) || 0])
      .nice()
      .range([height, 0])

    // Create gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0)

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#06b6d4')
      .attr('stop-opacity', 0.8)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0891b2')
      .attr('stop-opacity', 1)

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

    // Add bars
    g.selectAll('.bar')
      .data(processedData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.shortUrl) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', 'url(#bar-gradient)')
      .attr('rx', 4)
      .attr('ry', 4)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)

        tooltip
          .style('visibility', 'visible')
          .html(`
            <div>
              <div style="font-weight: 600;">${d.views} views</div>
              <div style="color: #94a3b8; font-size: 11px; max-width: 200px; word-wrap: break-word;">
                ${d.url}
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
          .attr('opacity', 1)

        tooltip.style('visibility', 'hidden')
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('y', d => yScale(d.views))
      .attr('height', d => height - yScale(d.views))

    // Add value labels on bars
    g.selectAll('.bar-label')
      .data(processedData)
      .enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', d => (xScale(d.shortUrl) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.views) - 5)
      .attr('text-anchor', 'middle')
      .style('fill', '#e2e8f0')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .text(d => d.views)
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 400)
      .style('opacity', 1)

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

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

  return (
    <GlassmorphismCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Popular Pages</h3>
          <p className="text-slate-400 text-sm">
            Top {Math.min(data.length, 10)} pages by views
          </p>
        </div>
        <div className="p-2 bg-cyan-600/20 rounded-lg">
          <BarChart3 size={20} className="text-cyan-400" />
        </div>
      </div>

      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full" />
      </div>

      {data.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">No page view data available</p>
        </div>
      )}
    </GlassmorphismCard>
  )
}