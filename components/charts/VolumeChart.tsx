import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { OHLCData } from '@/lib/types'

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
  // Format data for chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: item.volume
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">{payload[0].payload.date}</p>
          <p className="text-base font-semibold text-gray-900">
            {payload[0].value.toLocaleString()} shares
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {showTitle && <h3 className="mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="volume" 
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
