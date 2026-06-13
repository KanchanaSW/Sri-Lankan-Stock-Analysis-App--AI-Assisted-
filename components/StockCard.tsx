'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { StockWithScores } from '@/lib/types'
import RiskIndicator from './RiskIndicator'
import { formatRelativeTime } from '@/lib/formatRelativeTime'

interface StockCardProps {
  stock: StockWithScores
  type: 'very-long-term' | 'long-term' | 'short-term'
  showExplanation?: boolean
  index?: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  }),
}

export default function StockCard({ stock, type, showExplanation = false, index = 0 }: StockCardProps) {
  let score = 0;
  let colorClass = '';
  let bgClass = '';
  let borderClass = '';
  let explanationText = '';
  
  if (type === 'very-long-term') {
    score = stock.scores.veryLongTermScore;
    colorClass = 'text-purple-600 dark:text-purple-400';
    bgClass = 'bg-purple-50 dark:bg-purple-900/20';
    borderClass = 'border-purple-200 dark:border-purple-800/50';
    explanationText = stock.explanation.veryLongTermAnalysis || stock.explanation.longTermAnalysis;
  } else if (type === 'long-term') {
    score = stock.scores.longTermScore;
    colorClass = 'text-green-600 dark:text-green-400';
    bgClass = 'bg-green-50 dark:bg-green-900/20';
    borderClass = 'border-green-200 dark:border-green-800/50';
    explanationText = stock.explanation.longTermAnalysis;
  } else {
    score = stock.scores.shortTermScore;
    colorClass = 'text-red-600 dark:text-red-400';
    bgClass = 'bg-red-50 dark:bg-red-900/20';
    borderClass = 'border-red-200 dark:border-red-800/50';
    explanationText = stock.explanation.shortTermAnalysis;
  }

  const snippet = explanationText ? explanationText.split('.')[0] + '.' : '';
  
  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
    >
      <Link href={`/stocks/${stock.id}`}>
        <div className={`p-4 rounded-lg border ${borderClass} ${bgClass} hover:shadow-md dark:hover:shadow-purple-900/10 transition-shadow cursor-pointer h-full flex flex-col`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{stock.name}</p>
            </div>
            <motion.div
              className={`text-2xl font-bold ${colorClass} ml-2`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.07 + 0.2, type: 'spring', stiffness: 300, damping: 20 }}
            >
              {score}
            </motion.div>
          </div>
          
          {showExplanation && (
            <div className="mb-3">
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{snippet}</p>
            </div>
          )}
          
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-2">
              <RiskIndicator level={stock.explanation.riskLevel} size="sm" showIcon={false} />
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">{stock.sector}</span>
              <div className="text-right">
                <span className={`text-sm font-medium block ${stock.priceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stock.priceChange >= 0 ? '+' : ''}{stock.priceChange.toFixed(2)}%
                </span>
                {stock.updatedAt && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatRelativeTime(stock.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Export the type for backwards compatibility with old code
export type { StockWithScores as Stock }
