import { ScoreFactors, MomentumFactors } from '@/lib/types'

interface ScoreBreakdownProps {
  type: 'long-term' | 'short-term'
  factors: ScoreFactors | MomentumFactors
}

export default function ScoreBreakdown({ type, factors }: ScoreBreakdownProps) {
  const longTermFactorWeights = {
    priceVolatility: { weight: 25, label: 'Price Volatility' },
    trendConsistency: { weight: 25, label: 'Trend Consistency' },
    volumeStability: { weight: 20, label: 'Volume Stability' },
    sectorStrength: { weight: 20, label: 'Sector Strength' },
    marketCapStability: { weight: 10, label: 'Market Cap Stability' }
  }

  const shortTermFactorWeights = {
    volumeChange: { weight: 30, label: 'Volume Change' },
    priceMomentum: { weight: 30, label: 'Price Momentum' },
    breakoutDetection: { weight: 20, label: 'Breakout Detection' },
    trendAcceleration: { weight: 20, label: 'Trend Acceleration' }
  }

  const factorConfig = type === 'long-term' ? longTermFactorWeights : shortTermFactorWeights

  const getColorClass = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getTextColorClass = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="mb-4">
        {type === 'long-term' ? 'Long-Term Stability' : 'Short-Term Momentum'} Factor Breakdown
      </h3>
      
      <div className="space-y-4">
        {Object.entries(factors).map(([key, value]) => {
          const config = factorConfig[key as keyof typeof factorConfig]
          if (!config) return null

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({config.weight}% weight)
                  </span>
                </div>
                <span className={`text-sm font-semibold ${getTextColorClass(value)}`}>
                  {value}/100
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getColorClass(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Excellent (80+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Good (60-79)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span>Fair (40-59)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Poor (&lt;40)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
