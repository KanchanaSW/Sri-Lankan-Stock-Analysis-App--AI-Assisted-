'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { OHLCData } from '@/lib/types'
import { useTheme } from 'next-themes'

interface VolumeChartProps {
  data: OHLCData[]
  title?: string
  showTitle?: boolean
  height?: number
}

export default function VolumeChart({ 
  data, 
  title = 'Trading Volume', 
  showTitle = true,
  height = 300 
}: VolumeChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // Theme-aware colors
  const gridColor = isDark ? '#374151' : '#e5e7eb'  // gray-700 : gray-200
  const axisColor = isDark ? '#9ca3af' : '#6b7280'  // gray-400 : gray-500
  const barColor  = isDark ? '#a78bfa' : '#8b5cf6'  // violet-400 : violet-500

  // Format data for chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: item.volume
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">{payload[0].payload.date}</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {payload[0].value.toLocaleString()} shares
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
      {showTitle && <h3 className="mb-4 text-gray-900 dark:text-white">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="date" 
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis 
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="volume" 
            fill={barColor}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-100 dark:border-amber-800/50 italic">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>SIMULATED DATA - Volume estimation models based on recent activity benchmarks.</span>
      </div>
    </div>
  )
}
