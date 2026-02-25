'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StockCard from '@/components/StockCard'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { 
  useAllStocks, 
  useAvailableSectors, 
  filterStocksClient 
} from '@/lib/convexService'
import { getMarketCapRanges } from '@/lib/stockService'
import { InvestmentType, SortOption } from '@/lib/types'

export default function StocksPage() {
  const router = useRouter()
  const [selectedSector, setSelectedSector] = useState('All')
  const [selectedType, setSelectedType] = useState<InvestmentType>('all')
  const [sortBy, setSortBy] = useState<SortOption>('long-term')
  const [selectedMarketCapRange, setSelectedMarketCapRange] = useState('All')

  const { stocks, isLoading } = useAllStocks();
  const availableSectors = useAvailableSectors();
  const marketCapRanges = getMarketCapRanges();

  // Get market cap range values
  const currentMarketCapRange = marketCapRanges.find(r => r.label === selectedMarketCapRange)

  // Apply filters using client-side filtering
  const filteredStocks = filterStocksClient(stocks, {
    sector: selectedSector,
    investmentType: selectedType,
    sortBy,
    minMarketCap: currentMarketCapRange?.min,
    maxMarketCap: currentMarketCapRange?.max
  })

  return (
    <div>
      <DisclaimerBanner />
      
      <section className="py-12">
        <div className="container-custom">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <svg 
              className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          <h1 className="mb-8 text-gray-900 dark:text-white">All Stocks</h1>
          
          {/* Filters */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sector Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sector
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableSectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investment Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as InvestmentType)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Stocks</option>
                  <option value="long-term">Long-Term (Score ≥ 70)</option>
                  <option value="short-term">Short-Term (Score ≥ 70)</option>
                </select>
              </div>

              {/* Market Cap Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Market Cap
                </label>
                <select
                  value={selectedMarketCapRange}
                  onChange={(e) => setSelectedMarketCapRange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {marketCapRanges.map(range => (
                    <option key={range.label} value={range.label}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="long-term">Long-Term Score</option>
                  <option value="short-term">Short-Term Score</option>
                  <option value="price">Price</option>
                  <option value="change">Price Change</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Showing {filteredStocks.length} stocks
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <LoadingSkeleton type="card" count={8} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStocks.map((stock) => (
                  <StockCard
                    key={stock.id}
                    stock={stock}
                    type={sortBy === 'long-term' || sortBy === 'price' || sortBy === 'change' ? 'long-term' : 'short-term'}
                    showExplanation={false}
                  />
                ))}
              </div>

              {filteredStocks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No stocks found matching your filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
