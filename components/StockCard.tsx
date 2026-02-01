import Link from 'next/link'

export interface Stock {
  id: string
  symbol: string
  name: string
  sector: string
  longTermScore?: number
  shortTermScore?: number
  price: number
  change: number
}

interface StockCardProps {
  stock: Stock
  type: 'long-term' | 'short-term'
}

export default function StockCard({ stock, type }: StockCardProps) {
  const score = type === 'long-term' ? stock.longTermScore : stock.shortTermScore
  const colorClass = type === 'long-term' ? 'text-green-600' : 'text-red-600'
  const bgClass = type === 'long-term' ? 'bg-green-50' : 'bg-red-50'
  const borderClass = type === 'long-term' ? 'border-green-200' : 'border-red-200'
  
  return (
    <Link href={`/stocks/${stock.id}`}>
      <div className={`p-4 rounded-lg border ${borderClass} ${bgClass} hover:shadow-md transition-shadow cursor-pointer`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{stock.symbol}</h3>
            <p className="text-sm text-gray-600">{stock.name}</p>
          </div>
          <div className={`text-2xl font-bold ${colorClass}`}>
            {score}
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-500">{stock.sector}</span>
          <span className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
          </span>
        </div>
      </div>
    </Link>
  )
}
