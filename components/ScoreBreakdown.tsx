'use client'

import { motion, type Variants } from 'framer-motion'
import { ScoreFactors, MomentumFactors, VeryLongTermFactors } from '@/lib/types'
import { getScoreColorClass, getScoreTextColorClass } from '@/lib/scoring'
import Tooltip from './Tooltip'
import { getFactorTooltip } from '@/lib/tooltipContent'

interface ScoreBreakdownProps {
  type: 'very-long-term' | 'long-term' | 'short-term'
  factors: ScoreFactors | MomentumFactors | VeryLongTermFactors
}

type FactorWeight = { weight: number; label: string }

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
}

export default function ScoreBreakdown({ type, factors }: ScoreBreakdownProps) {
  const longTermFactorWeights: Record<keyof ScoreFactors, FactorWeight> = {
    priceVolatility: { weight: 25, label: 'Price Volatility' },
    trendConsistency: { weight: 25, label: 'Trend Consistency' },
    volumeStability: { weight: 20, label: 'Volume Stability' },
    sectorStrength: { weight: 20, label: 'Sector Strength' },
    marketCapStability: { weight: 10, label: 'Market Cap Stability' }
  }

  const shortTermFactorWeights: Record<keyof MomentumFactors, FactorWeight> = {
    volumeChange: { weight: 30, label: 'Volume Change' },
    priceMomentum: { weight: 30, label: 'Price Momentum' },
    breakoutDetection: { weight: 20, label: 'Breakout Detection' },
    trendAcceleration: { weight: 20, label: 'Trend Acceleration' }
  }

  const veryLongTermFactorWeights: Record<keyof VeryLongTermFactors, FactorWeight> = {
    fiveYearPerformance: { weight: 40, label: '5-Year Performance' },
    oneYearPerformance: { weight: 15, label: '1-Year Performance' },
    priceToHigh52: { weight: 15, label: 'Price to 52-Week High' },
    marketCapSize: { weight: 15, label: 'Market Cap Stability' },
    downsideVolatility: { weight: 15, label: 'Downside Risk' }
  }

  const factorConfig: Record<string, FactorWeight> = type === 'very-long-term' ? veryLongTermFactorWeights : type === 'long-term' ? longTermFactorWeights : shortTermFactorWeights

  const getColorClass = (score: number) => {
    if (type === 'very-long-term') {
      if (score >= 80) return 'bg-purple-600'
      if (score >= 60) return 'bg-purple-500'
      if (score >= 40) return 'bg-purple-400'
      return 'bg-purple-300'
    }
    return getScoreColorClass(score)
  }

  const getTextColorClass = (score: number) => {
    if (type === 'very-long-term') {
      if (score >= 60) return 'text-purple-600'
      return 'text-purple-400'
    }
    return getScoreTextColorClass(score)
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <h3 className="mb-4 text-gray-900 dark:text-white">
        {type === 'very-long-term' ? 'Very Long-Term (Buy & Hold)' : type === 'long-term' ? 'Long-Term Stability' : 'Short-Term Momentum'} Factor Breakdown
      </h3>
      
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {Object.entries(factors).map(([key, value]) => {
          const config = factorConfig[key as keyof typeof factorConfig]
          if (!config) return null

          return (
            <motion.div key={key} variants={rowVariants}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({config.weight}% weight)
                  </span>
                  {getFactorTooltip(type, key) && (
                    <Tooltip content={getFactorTooltip(type, key)!} size="xs" />
                  )}
                </div>
                <span className={`text-sm font-semibold ${getTextColorClass(value)}`}>
                  {value}/100
                </span>
              </div>
              
              {/* Animated progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${getColorClass(value)}`}
                  initial={{ width: '0%' }}
                  whileInView={{ width: `${value}%` }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
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
