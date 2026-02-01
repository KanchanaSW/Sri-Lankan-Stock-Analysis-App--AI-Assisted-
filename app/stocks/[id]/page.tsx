'use client'

import { useParams } from 'next/navigation'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import { mockAllStocks } from '@/lib/mockData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Mock historical data
const generateHistoricalData = (basePrice: number) => {
  const data = []
  const now = new Date()
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const variance = (Math.random() - 0.5) * basePrice * 0.1
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: basePrice + variance,
      volume: Math.floor(Math.random() * 1000000) + 500000
    })
  }
  return data
}

export default function StockDetailPage() {
  const params = useParams()
  const stock = mockAllStocks.find(s => s.id === params.id)

  if (!stock) {
    return (
      <div className="container-custom py-12">
        <p className="text-center text-gray-600">Stock not found</p>
      </div>
    )
  }

  const historicalData = generateHistoricalData(stock.price)
  
  // Calculate risk level based on scores
  const avgScore = ((stock.longTermScore ?? 50) + (stock.shortTermScore ?? 50)) / 2
  const riskLevel = avgScore >= 75 ? 'Low' : avgScore >= 60 ? 'Medium' : 'High'
  const riskColor = riskLevel === 'Low' ? 'text-green-600 bg-green-50' : 
                    riskLevel === 'Medium' ? 'text-amber-600 bg-amber-50' : 
                    'text-red-600 bg-red-50'

  return (
    <div>
      <DisclaimerBanner />
      
      <section className="py-12">
        <div className="container-custom">
          {/* Stock Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="mb-2">{stock.symbol}</h1>
                <p className="text-lg text-gray-600">{stock.name}</p>
                <p className="text-sm text-gray-500 mt-1">{stock.sector}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">Rs. {stock.price.toFixed(2)}</p>
                <p className={`text-lg font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Scores & Risk */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Long-Term Stability Score</p>
              <p className="text-5xl font-bold text-green-600">{stock.longTermScore ?? 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-2">Out of 100</p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Short-Term Momentum Score</p>
              <p className="text-5xl font-bold text-red-600">{stock.shortTermScore ?? 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-2">Out of 100</p>
            </div>

            <div className={`border rounded-lg p-6 ${riskColor}`}>
              <p className="text-sm mb-2">Risk Level</p>
              <p className="text-5xl font-bold">{riskLevel}</p>
              <p className="text-xs mt-2">Based on analysis</p>
            </div>
          </div>

          {/* AI-Generated Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="mb-3 text-blue-900">AI-Assisted Analysis</h3>
            <p className="text-gray-700 leading-relaxed">
              {stock.longTermScore && stock.longTermScore >= 70 ? (
                <>
                  This stock demonstrates stable price movement with relatively low volatility over recent periods, 
                  making it a suitable candidate for long-term holding. The consistent trading volumes and strong 
                  sector fundamentals support its stability score. Historical performance suggests reliable returns 
                  over extended investment horizons.
                </>
              ) : stock.shortTermScore && stock.shortTermScore >= 70 ? (
                <>
                  This stock is currently showing high momentum with significant volume spikes and positive price 
                  breakouts. The short-term indicators suggest strong market interest and potential for near-term 
                  gains. However, higher volatility means increased risk, making it more suitable for active trading 
                  rather than buy-and-hold strategies.
                </>
              ) : (
                <>
                  This stock presents a balanced risk-reward profile with moderate scores across both long-term 
                  and short-term indicators. While it may not be the strongest performer in either category, it 
                  offers diversification potential. Investors should consider their individual risk tolerance and 
                  investment timeline before making decisions.
                </>
              )}
            </p>
          </div>

          {/* Price Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="mb-4">Price History (30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                  formatter={(value: number) => [`Rs. ${value.toFixed(2)}`, 'Price']}
                />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="mb-4">Trading Volume (30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                />
                <Bar dataKey="volume" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  )
}
