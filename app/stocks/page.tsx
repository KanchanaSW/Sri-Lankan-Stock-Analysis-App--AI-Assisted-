'use client'

import { useState } from 'react'
import StockCard from '@/components/StockCard'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { filterStocks, getAvailableSectors, getMarketCapRanges } from '@/lib/stockService'
import { InvestmentType, SortOption } from '@/lib/types'

export default function StocksPage() {
  const [selectedSector, setSelectedSector] = useState('All')
  const [selectedType, setSelectedType] = useState<InvestmentType>('all')
  const [sortBy, setSortBy] = useState<SortOption>('long-term')
  const [selectedMarketCapRange, setSelectedMarketCapRange] = useState('All')
  const [isLoading, setIsLoading] = useState(false)

  const availableSectors = getAvailableSectors()
  const marketCapRanges = getMarketCapRanges()

  // Get market cap range values
  const currentMarketCapRange = marketCapRanges.find(r => r.label === selectedMarketCapRange)

  // Apply filters
  const filteredStocks = filterStocks({
    sector: selectedSector,
    investmentType: selectedType,
    sortBy,
    minMarketCap: currentMarketCapRange?.min,
    maxMarketCap: currentMarketCapRange?.max
  })

  const handleFilterChange = (callback: () => void) => {
    setIsLoading(true)
    callback()
    // Simulate loading state
    setTimeout(() => setIsLoading(false), 300)
  }

  return (
    <div>
      <DisclaimerBanner />
      
      <section className="py-12">
        <div className="container-custom">
          <h1 className="mb-8">All Stocks</h1>
          
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sector Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => handleFilterChange(() => setSelectedSector(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableSectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => handleFilterChange(() => setSelectedType(e.target.value as InvestmentType))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Stocks</option>
                  <option value="long-term">Long-Term (Score ≥ 70)</option>
                  <option value="short-term">Short-Term (Score ≥ 70)</option>
                </select>
              </div>

              {/* Market Cap Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Cap
                </label>
                <select
                  value={selectedMarketCapRange}
                  onChange={(e) => handleFilterChange(() => setSelectedMarketCapRange(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {marketCapRanges.map(range => (
                    <option key={range.label} value={range.label}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange(() => setSortBy(e.target.value as SortOption))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <p className="text-sm text-gray-600 mb-4">
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
                  <p className="text-gray-500">No stocks found matching your filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
