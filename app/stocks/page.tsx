'use client'

import { useState } from 'react'
import StockCard from '@/components/StockCard'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import { mockAllStocks } from '@/lib/mockData'

const sectors = ['All', 'Banking', 'Finance', 'Diversified', 'Manufacturing', 'Telecommunications', 'Energy', 'Healthcare']

export default function StocksPage() {
  const [selectedSector, setSelectedSector] = useState('All')
  const [selectedType, setSelectedType] = useState<'all' | 'long-term' | 'short-term'>('all')
  const [sortBy, setSortBy] = useState<'long-term' | 'short-term'>('long-term')

  const filteredStocks = mockAllStocks.filter(stock => {
    const sectorMatch = selectedSector === 'All' || stock.sector === selectedSector
    const typeMatch = selectedType === 'all' || 
      (selectedType === 'long-term' && (stock.longTermScore ?? 0) >= 70) ||
      (selectedType === 'short-term' && (stock.shortTermScore ?? 0) >= 70)
    return sectorMatch && typeMatch
  }).sort((a, b) => {
    if (sortBy === 'long-term') {
      return (b.longTermScore ?? 0) - (a.longTermScore ?? 0)
    }
    return (b.shortTermScore ?? 0) - (a.shortTermScore ?? 0)
  })

  return (
    <div>
      <DisclaimerBanner />
      
      <section className="py-12">
        <div className="container-custom">
          <h1 className="mb-8">All Stocks</h1>
          
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sector Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sectors.map(sector => (
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
                  onChange={(e) => setSelectedType(e.target.value as 'all' | 'long-term' | 'short-term')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Stocks</option>
                  <option value="long-term">Long-Term (Score ≥ 70)</option>
                  <option value="short-term">Short-Term (Score ≥ 70)</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'long-term' | 'short-term')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="long-term">Long-Term Score</option>
                  <option value="short-term">Short-Term Score</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <p className="text-sm text-gray-600 mb-4">
            Showing {filteredStocks.length} stocks
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStocks.map((stock) => (
              <StockCard
                key={stock.id}
                stock={stock}
                type={sortBy === 'long-term' ? 'long-term' : 'short-term'}
              />
            ))}
          </div>

          {filteredStocks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No stocks found matching your filters.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
