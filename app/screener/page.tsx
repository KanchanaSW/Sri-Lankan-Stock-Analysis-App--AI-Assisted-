'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import ScreenerFilters, { ScreenerFilterState } from '@/components/ScreenerFilters'
import StockCard from '@/components/StockCard'
import { Loader2 } from 'lucide-react'
import { StockWithScores } from '@/lib/types'

const initialFilters: ScreenerFilterState = {
  searchQuery: '',
  sector: 'All',
  minMarketCap: '',
  maxMarketCap: '',
  minPrice: '',
  maxPrice: '',
  riskLevel: [],
  minVeryLongTermScore: 0,
  minLongTermScore: 0,
  minShortTermScore: 0,
}

export default function ScreenerPage() {
  const stocks = useQuery(api.stocks.getBasicStocks) as any[] | undefined
  const sectors = useQuery(api.stocks.getAvailableSectors)
  
  const [filters, setFilters] = useState<ScreenerFilterState>(initialFilters)
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'vltScore' | 'ltScore' | 'stScore'>('vltScore')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredStocks = useMemo(() => {
    if (!stocks) return []

    return stocks.filter(stock => {
      // Search
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        if (!stock.symbol.toLowerCase().includes(query) && !stock.name.toLowerCase().includes(query)) {
          return false
        }
      }

      // Sector
      if (filters.sector !== 'All' && stock.sector !== filters.sector) return false

      // Risk Level
      if (filters.riskLevel.length > 0) {
        // Fallback to Medium if explanation/riskLevel is missing
        const risk = stock.aiExplanation?.riskLevel || 'Medium'
        if (!filters.riskLevel.includes(risk as any)) return false
      }

      // Price
      if (filters.minPrice !== '' && stock.currentPrice < parseFloat(filters.minPrice)) return false
      if (filters.maxPrice !== '' && stock.currentPrice > parseFloat(filters.maxPrice)) return false

      // Market Cap
      if (filters.minMarketCap !== '' && stock.marketCap < parseFloat(filters.minMarketCap)) return false
      if (filters.maxMarketCap !== '' && stock.marketCap > parseFloat(filters.maxMarketCap)) return false

      // Scores
      if (stock.scores) {
        if (filters.minVeryLongTermScore > 0 && stock.scores.veryLongTermScore < filters.minVeryLongTermScore) return false
        if (filters.minLongTermScore > 0 && stock.scores.longTermScore < filters.minLongTermScore) return false
        if (filters.minShortTermScore > 0 && stock.scores.shortTermScore < filters.minShortTermScore) return false
      } else if (filters.minVeryLongTermScore > 0 || filters.minLongTermScore > 0 || filters.minShortTermScore > 0) {
        // If they filter by score but stock has no scores, exclude it
        return false
      }

      return true
    }).sort((a, b) => {
      let valA, valB

      switch (sortBy) {
        case 'symbol':
          valA = a.symbol
          valB = b.symbol
          break
        case 'price':
          valA = a.currentPrice
          valB = b.currentPrice
          break
        case 'vltScore':
          valA = a.scores?.veryLongTermScore || 0
          valB = b.scores?.veryLongTermScore || 0
          break
        case 'ltScore':
          valA = a.scores?.longTermScore || 0
          valB = b.scores?.longTermScore || 0
          break
        case 'stScore':
          valA = a.scores?.shortTermScore || 0
          valB = b.scores?.shortTermScore || 0
          break
        default:
          valA = 0
          valB = 0
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [stocks, filters, sortBy, sortOrder])

  const handleClearFilters = () => setFilters(initialFilters)

  // Quick formatter to match StockCard expectations
  // We don't have historicalData on the frontend for basic stocks, but StockCard doesn't use it
  const formatForCard = (stock: any): StockWithScores => ({
    id: stock._id,
    symbol: stock.symbol,
    name: stock.name,
    sector: stock.sector,
    marketCap: stock.marketCap,
    currentPrice: stock.currentPrice,
    priceChange: stock.priceChange,
    weekHigh52: stock.weekHigh52,
    weekLow52: stock.weekLow52,
    historicalData: [], // Default empty array as we didn't fetch OHLC
    scores: stock.scores || {
      longTermScore: 50, shortTermScore: 50, veryLongTermScore: 50,
      longTermFactors: { priceVolatility: 0, trendConsistency: 0, volumeStability: 0, sectorStrength: 0, marketCapStability: 0 },
      shortTermFactors: { volumeChange: 0, priceMomentum: 0, breakoutDetection: 0, trendAcceleration: 0 },
      veryLongTermFactors: { fiveYearPerformance: 0, oneYearPerformance: 0, priceToHigh52: 0, marketCapSize: 0, downsideVolatility: 0 }
    },
    explanation: stock.aiExplanation || {
      summary: '', longTermAnalysis: '', shortTermAnalysis: '', riskLevel: 'Medium', riskReasoning: '', keyStrengths: [], keyConcerns: []
    }
  })

  // Determine what type to pass to StockCard based on sorting
  const getCardType = (): 'very-long-term' | 'long-term' | 'short-term' => {
    if (sortBy === 'vltScore') return 'very-long-term'
    if (sortBy === 'ltScore') return 'long-term'
    if (sortBy === 'stScore') return 'short-term'
    return 'very-long-term' // fallback
  }

  if (!stocks || !sectors) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Screener...</h2>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
          Stock Screener
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Filter and discover stocks matching your specific investment criteria.
        </p>
      </div>

      <ScreenerFilters 
        filters={filters} 
        setFilters={setFilters} 
        availableSectors={sectors} 
        onClearFilters={handleClearFilters}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {filteredStocks.length} {filteredStocks.length === 1 ? 'Result' : 'Results'}
        </h2>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="vltScore">Very Long-Term Score</option>
            <option value="ltScore">Long-Term Score</option>
            <option value="stScore">Short-Term Score</option>
            <option value="price">Price</option>
            <option value="symbol">Symbol</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {filteredStocks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No stocks matched your criteria.</p>
          <button 
            onClick={handleClearFilters}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((stock, i) => (
            <StockCard 
              key={stock._id} 
              stock={formatForCard(stock)} 
              type={getCardType()} 
              index={i} 
              showExplanation={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
