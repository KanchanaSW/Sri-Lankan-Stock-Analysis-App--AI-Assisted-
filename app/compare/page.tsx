'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAllStocks } from '@/lib/convexService'
import { StockWithScores } from '@/lib/types'
import { formatMarketCap } from '@/lib/stockService'
import RiskIndicator from '@/components/RiskIndicator'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import DisclaimerBanner from '@/components/DisclaimerBanner'

export default function ComparePage() {
  const { stocks, isLoading } = useAllStocks()
  const [selectedStocks, setSelectedStocks] = useState<StockWithScores[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Filter available stocks based on search query
  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return stocks.filter(stock => 
      !selectedStocks.find(s => s.id === stock.id) && // Don't show already selected
      (stock.symbol.toLowerCase().includes(query) || stock.name.toLowerCase().includes(query))
    ).slice(0, 5) // Limit to 5 suggestions
  }, [stocks, searchQuery, selectedStocks])

  const handleSelectStock = (stock: StockWithScores) => {
    if (selectedStocks.length < 4) {
      setSelectedStocks([...selectedStocks, stock])
      setSearchQuery('')
      setShowDropdown(false)
    }
  }

  const handleRemoveStock = (id: string) => {
    setSelectedStocks(selectedStocks.filter(s => s.id !== id))
  }

  if (isLoading) {
    return (
      <div>
        <DisclaimerBanner />
        <div className="container-custom py-12">
          <LoadingSkeleton type="card" count={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <DisclaimerBanner />
      
      <div className="container-custom py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Compare Stocks</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select up to 4 stocks to compare their fundamental metrics, scores, and AI analysis side-by-side.
          </p>
        </div>

        {/* Search & Selector */}
        <div className="mb-10 max-w-xl relative">
          <div className="relative">
            <input
              type="text"
              placeholder={selectedStocks.length >= 4 ? "Comparison limit reached (4 max)" : "Search by stock symbol or name..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              disabled={selectedStocks.length >= 4}
              className={`w-full px-4 py-3 rounded-lg border ${
                selectedStocks.length >= 4 
                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed text-gray-500' 
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              } text-gray-900 dark:text-white transition-colors`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showDropdown && searchQuery && filteredStocks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                {filteredStocks.map(stock => (
                  <button
                    key={stock.id}
                    onClick={() => handleSelectStock(stock)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white mr-2">{stock.symbol}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{stock.sector}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comparison Grid */}
        {selectedStocks.length > 0 ? (
          <div className="overflow-x-auto pb-6">
            <div className="inline-flex min-w-full gap-4">
              {/* Features Label Column (First Column) */}
              <div className="w-48 shrink-0 hidden md:flex flex-col border border-transparent">
                <div className="h-32 border-b border-transparent"></div> {/* Empty space for header alignment */}
                
                {/* Labels */}
                <div className="p-4 space-y-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <div className="h-12 flex items-center border-b border-gray-100 dark:border-gray-800 pb-2">Price</div>
                  <div className="h-12 flex items-center border-b border-gray-100 dark:border-gray-800 pb-2">Sector</div>
                  <div className="h-12 flex items-center border-b border-gray-100 dark:border-gray-800 pb-2">Market Cap</div>
                  
                  <div className="pt-6 h-16 flex items-center border-b border-purple-100 dark:border-purple-900/30 pb-2 text-purple-600 dark:text-purple-400">Very Long-Term Score</div>
                  <div className="h-16 flex items-center border-b border-green-100 dark:border-green-900/30 pb-2 text-green-600 dark:text-green-400">Long-Term Score</div>
                  <div className="h-16 flex items-center border-b border-red-100 dark:border-red-900/30 pb-2 text-red-600 dark:text-red-400">Short-Term Score</div>
                  
                  <div className="pt-6 h-32 flex items-start border-b border-gray-100 dark:border-gray-800 pb-2">Risk Level</div>
                  <div className="pt-6 flex items-start">AI Summary</div>
                </div>
              </div>

              {/* Selected Stocks Columns */}
              <AnimatePresence mode="popLayout">
                {selectedStocks.map((stock) => (
                  <motion.div
                    key={stock.id}
                    layoutId={`compare-col-${stock.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                    className="w-64 md:w-80 shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm"
                  >
                    {/* Header Action */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 h-32 flex flex-col justify-between relative">
                      <button
                        onClick={() => handleRemoveStock(stock.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${stock.symbol}`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                      
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate pr-6" title={stock.name}>{stock.name}</p>
                      </div>
                    </div>

                    {/* Data Rows */}
                    <div className="p-4 space-y-6 text-sm">
                      {/* Mobile Labels (Only visible on small screens) */}
                      <div className="h-12 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                        <span className="md:hidden text-gray-500">Price</span>
                        <div className="text-right w-full md:text-left font-semibold text-gray-900 dark:text-white">
                          Rs. {stock.currentPrice.toFixed(2)}
                          <span className={`ml-2 text-xs font-normal ${stock.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.priceChange >= 0 ? '+' : ''}{stock.priceChange.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="h-12 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                        <span className="md:hidden text-gray-500">Sector</span>
                        <span className="text-gray-900 dark:text-white truncate" title={stock.sector}>{stock.sector}</span>
                      </div>

                      <div className="h-12 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                        <span className="md:hidden text-gray-500">Market Cap</span>
                        <span className="text-gray-900 dark:text-white">{formatMarketCap(stock.marketCap)}</span>
                      </div>

                      {/* Scores */}
                      <div className="pt-6 h-16 flex items-center justify-between border-b border-purple-100 dark:border-purple-900/30 pb-2">
                        <span className="md:hidden text-purple-600 dark:text-purple-400">Very Long-Term</span>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stock.scores.veryLongTermScore}</span>
                      </div>

                      <div className="h-16 flex items-center justify-between border-b border-green-100 dark:border-green-900/30 pb-2">
                        <span className="md:hidden text-green-600 dark:text-green-400">Long-Term</span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stock.scores.longTermScore}</span>
                      </div>

                      <div className="h-16 flex items-center justify-between border-b border-red-100 dark:border-red-900/30 pb-2">
                        <span className="md:hidden text-red-600 dark:text-red-400">Short-Term</span>
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400">{stock.scores.shortTermScore}</span>
                      </div>

                      {/* Risk */}
                      <div className="pt-6 h-32 flex flex-col md:flex-row items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                        <span className="md:hidden text-gray-500 mb-2">Risk Level</span>
                        <div className="w-full">
                          <RiskIndicator level={stock.explanation.riskLevel} size="md" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3" title={stock.explanation.riskReasoning}>
                            {stock.explanation.riskReasoning}
                          </p>
                        </div>
                      </div>

                      {/* AI Summary */}
                      <div className="pt-6 flex flex-col md:flex-row items-start justify-between">
                        <span className="md:hidden text-gray-500 mb-2">AI Summary</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                          {stock.explanation.summary}
                        </p>
                      </div>

                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No stocks selected</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Search and select up to 4 stocks from the input above to start comparing their metrics side-by-side.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
