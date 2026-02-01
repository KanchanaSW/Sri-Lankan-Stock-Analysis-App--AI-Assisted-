import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { OHLCData } from '@/lib/types'

interface PriceChartProps {
  data: OHLCData[]
  title?: string
  showTitle?: boolean
  height?: number
}

export default function PriceChart({ 
  data, 
  title = 'Price History', 
  showTitle = true,
  height = 300 
}: PriceChartProps) {
  // Format data for chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: item.close
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">{payload[0].payload.date}</p>
          <p className="text-base font-semibold text-gray-900">
            Rs. {payload[0].value.toFixed(2)}
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
        <LineChart data={chartData}>
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
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
