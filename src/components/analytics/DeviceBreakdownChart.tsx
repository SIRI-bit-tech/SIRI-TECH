'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import { Smartphone } from 'lucide-react'

interface DeviceData {
    device: string
    count: number
}

interface DeviceBreakdownChartProps {
    data: DeviceData[]
}

export function DeviceBreakdownChart({ data }: DeviceBreakdownChartProps) {
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
        const radius = Math.min(width, height) / 2 - 30

        if (radius <= 0) return

        svg.attr('width', width)
            .attr('height', height)

        const g = svg.append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`)

        // Process data
        const total = data.reduce((sum, d) => sum + d.count, 0)
        const processedData = data.map(d => ({
            ...d,
            percentage: (d.count / total) * 100
        }))

        // Device type colors
        const deviceColors: { [key: string]: string } = {
            'desktop': '#06b6d4',
            'mobile': '#10b981',
            'tablet': '#f59e0b',
            'unknown': '#64748b'
        }

        const getDeviceColor = (device: string) => {
            const deviceType = device.toLowerCase()
            if (deviceType.includes('mobile') || deviceType.includes('phone')) return deviceColors.mobile
            if (deviceType.includes('tablet') || deviceType.includes('ipad')) return deviceColors.tablet
            if (deviceType === 'desktop' || deviceType === '') return deviceColors.desktop
            return deviceColors.unknown
        }

        // Pie generator
        const pie = d3.pie<DeviceData & { percentage: number }>()
            .value(d => d.count)
            .sort((a, b) => b.count - a.count)

        // Arc generator
        const arc = d3.arc<d3.PieArcDatum<DeviceData & { percentage: number }>>()
            .innerRadius(0)
            .outerRadius(radius)

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

        // Add paths with animation
        arcs.append('path')
            .attr('fill', d => getDeviceColor(d.data.device))
            .attr('stroke', '#1e293b')
            .attr('stroke-width', 2)
            .style('opacity', 0)
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 0.8)
                    .attr('transform', 'scale(1.05)')

                tooltip
                    .style('visibility', 'visible')
                    .html(`
            <div>
              <div style="font-weight: 600; text-transform: capitalize;">
                ${d.data.device || 'Desktop'}
              </div>
              <div style="color: #94a3b8; font-size: 11px;">
                ${d.data.count} visits (${d.data.percentage.toFixed(1)}%)
              </div>
            </div>
          `)
            })
            .on('mousemove', function (event) {
                tooltip
                    .style('top', (event.pageY - 10) + 'px')
                    .style('left', (event.pageX + 10) + 'px')
            })
            .on('mouseout', function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 1)
                    .attr('transform', 'scale(1)')

                tooltip.style('visibility', 'hidden')
            })
            .transition()
            .duration(800)
            .delay((d, i) => i * 150)
            .style('opacity', 1)
            .attrTween('d', function (d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
                return function (t) {
                    return arc(interpolate(t)) || ''
                }
            })

        // Add percentage labels
        arcs.append('text')
            .attr('transform', function (d) {
                const centroid = arc.centroid(d)
                return `translate(${centroid})`
            })
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('fill', 'white')
            .style('font-size', '14px')
            .style('font-weight', '600')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
            .text(function (d) {
                return d.data.percentage > 8 ? `${d.data.percentage.toFixed(0)}%` : ''
            })
            .style('opacity', 0)
            .transition()
            .duration(800)
            .delay((d, i) => i * 150 + 400)
            .style('opacity', 1)

        // Add center text with total
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.5em')
            .style('fill', '#e2e8f0')
            .style('font-size', '24px')
            .style('font-weight', '700')
            .text(total.toLocaleString())
            .style('opacity', 0)
            .transition()
            .duration(800)
            .delay(600)
            .style('opacity', 1)

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1em')
            .style('fill', '#94a3b8')
            .style('font-size', '12px')
            .text('Total Visits')
            .style('opacity', 0)
            .transition()
            .duration(800)
            .delay(700)
            .style('opacity', 1)

        // Cleanup tooltip on unmount
        return () => {
            d3.select('body').selectAll('.tooltip').remove()
        }
    }, [data])

    const totalDevices = data.reduce((sum, d) => sum + d.count, 0)

    return (
        <GlassmorphismCard className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Device Breakdown</h3>
                    <p className="text-slate-400 text-sm">
                        Visits by device type
                    </p>
                </div>
                <div className="p-2 bg-green-600/20 rounded-lg">
                    <Smartphone size={20} className="text-green-400" />
                </div>
            </div>

            <div ref={containerRef} className="w-full">
                <svg ref={svgRef} className="w-full" />
            </div>

            {data.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <p className="text-slate-400">No device data available</p>
                </div>
            )}

            {/* Device Stats List */}
            {data.length > 0 && (
                <div className="mt-6 space-y-3">
                    {data.map((item, index) => {
                        const percentage = totalDevices > 0 ? (item.count / totalDevices) * 100 : 0
                        const deviceColors: { [key: string]: string } = {
                            'desktop': '#06b6d4',
                            'mobile': '#10b981',
                            'tablet': '#f59e0b',
                            'unknown': '#64748b'
                        }

                        const getDeviceColor = (device: string) => {
                            const deviceType = device.toLowerCase()
                            if (deviceType.includes('mobile') || deviceType.includes('phone')) return deviceColors.mobile
                            if (deviceType.includes('tablet') || deviceType.includes('ipad')) return deviceColors.tablet
                            if (deviceType === 'desktop' || deviceType === '') return deviceColors.desktop
                            return deviceColors.unknown
                        }

                        return (
                            <div key={item.device} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: getDeviceColor(item.device) }}
                                    />
                                    <span className="text-sm text-slate-300 capitalize">
                                        {item.device || 'Desktop'}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-white font-medium">
                                        {item.count.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        ({percentage.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </GlassmorphismCard>
    )
}