import Link from 'next/link'
import { StockWithScores } from '@/lib/types'
import RiskIndicator from './RiskIndicator'

interface StockCardProps {
  stock: StockWithScores
  type: 'long-term' | 'short-term'
  showExplanation?: boolean
}

export default function StockCard({ stock, type, showExplanation = false }: StockCardProps) {
  const score = type === 'long-term' ? stock.scores.longTermScore : stock.scores.shortTermScore
  const colorClass = type === 'long-term' ? 'text-green-600' : 'text-red-600'
  const bgClass = type === 'long-term' ? 'bg-green-50' : 'bg-red-50'
  const borderClass = type === 'long-term' ? 'border-green-200' : 'border-red-200'
  
  // Get explanation snippet (first sentence)
  const explanationText = type === 'long-term' 
    ? stock.explanation.longTermAnalysis 
    : stock.explanation.shortTermAnalysis
  const snippet = explanationText.split('.')[0] + '.'
  
  return (
    <Link href={`/stocks/${stock.id}`}>
      <div className={`p-4 rounded-lg border ${borderClass} ${bgClass} hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{stock.symbol}</h3>
            <p className="text-sm text-gray-600 truncate">{stock.name}</p>
          </div>
          <div className={`text-2xl font-bold ${colorClass} ml-2`}>
            {score}
          </div>
        </div>
        
        {showExplanation && (
          <div className="mb-3">
            <p className="text-xs text-gray-700 line-clamp-2">{snippet}</p>
          </div>
        )}
        
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2">
            <RiskIndicator level={stock.explanation.riskLevel} size="sm" showIcon={false} />
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-500">{stock.sector}</span>
            <span className={`text-sm font-medium ${stock.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stock.priceChange >= 0 ? '+' : ''}{stock.priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Export the type for backwards compatibility with old code
export type { StockWithScores as Stock }
