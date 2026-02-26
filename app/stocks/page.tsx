'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
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

const filterBarVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

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
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <DisclaimerBanner />
      
      <section className="py-12">
        <div className="container-custom">
          {/* Back Button */}
          <motion.button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
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
          </motion.button>

          <motion.h1
            className="mb-8 text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            All Stocks
          </motion.h1>
          
          {/* Filters */}
          <motion.div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8 shadow-sm"
            variants={filterBarVariants}
            initial="hidden"
            animate="visible"
          >
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
          </motion.div>

          {/* Results count */}
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-400 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Showing {filteredStocks.length} stocks
          </motion.p>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <LoadingSkeleton type="card" count={8} />
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`${selectedSector}-${selectedType}-${sortBy}-${selectedMarketCapRange}`}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {filteredStocks.map((stock, i) => (
                    <StockCard
                      key={stock.id}
                      stock={stock}
                      type={sortBy === 'long-term' || sortBy === 'price' || sortBy === 'change' ? 'long-term' : 'short-term'}
                      showExplanation={false}
                      index={i}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {filteredStocks.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-500 dark:text-gray-400">No stocks found matching your filters.</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </motion.div>
  )
}
