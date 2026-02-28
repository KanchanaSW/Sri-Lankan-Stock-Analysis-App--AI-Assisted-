'use client'

import { motion } from 'framer-motion'
import { Filter, X, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { SectorData } from '@/lib/types'

export interface ScreenerFilterState {
  searchQuery: string
  sector: string
  minMarketCap: string
  maxMarketCap: string
  minPrice: string
  maxPrice: string
  riskLevel: ('Low' | 'Medium' | 'High')[]
  minVeryLongTermScore: number
  minLongTermScore: number
  minShortTermScore: number
}

interface ScreenerFiltersProps {
  filters: ScreenerFilterState
  setFilters: React.Dispatch<React.SetStateAction<ScreenerFilterState>>
  availableSectors: string[]
  onClearFilters: () => void
}

export default function ScreenerFilters({
  filters,
  setFilters,
  availableSectors,
  onClearFilters,
}: ScreenerFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleRiskChange = (level: 'Low' | 'Medium' | 'High') => {
    setFilters((prev) => {
      const current = prev.riskLevel
      if (current.includes(level)) {
        return { ...prev, riskLevel: current.filter((l) => l !== level) }
      } else {
        return { ...prev, riskLevel: [...current, level] }
      }
    })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchQuery' || key === 'sector') return value !== '' && value !== 'All'
    if (key === 'riskLevel') return (value as string[]).length > 0
    if (key.startsWith('min') && key.endsWith('Score')) return value > 0
    return value !== ''
  }).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Advanced Filters</h2>
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters();
              }}
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Clear All
            </button>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Symbol or Company Name"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm dark:text-white transition-colors"
              />
            </div>
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sector</label>
            <select
              value={filters.sector}
              onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm dark:text-white transition-colors appearance-none"
            >
              {availableSectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>

          {/* Risk Level */}
          <div className="space-y-2 lg:col-span-2 xl:col-span-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Level</label>
            <div className="flex flex-wrap gap-2">
              {(['Low', 'Medium', 'High'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => handleRiskChange(level)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                    filters.riskLevel.includes(level)
                      ? level === 'Low' ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300'
                      : level === 'Medium' ? 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300'
                      : 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price (Rs)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
              />
            </div>
          </div>

          {/* Market Cap */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Market Cap (M)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minMarketCap}
                onChange={(e) => setFilters(prev => ({ ...prev, minMarketCap: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxMarketCap}
                onChange={(e) => setFilters(prev => ({ ...prev, maxMarketCap: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
              />
            </div>
          </div>

          {/* Scores */}
          <div className="space-y-4 md:col-span-2 xl:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Minimum AI Scores</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-purple-600 dark:text-purple-400 font-medium">Very Long-Term</span>
                  <span className="text-gray-500">{filters.minVeryLongTermScore > 0 ? `${filters.minVeryLongTermScore}+` : 'Any'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="5"
                  value={filters.minVeryLongTermScore}
                  onChange={(e) => setFilters(prev => ({ ...prev, minVeryLongTermScore: parseInt(e.target.value) }))}
                  className="w-full accent-purple-600"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-green-600 dark:text-green-400 font-medium">Long-Term</span>
                  <span className="text-gray-500">{filters.minLongTermScore > 0 ? `${filters.minLongTermScore}+` : 'Any'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="5"
                  value={filters.minLongTermScore}
                  onChange={(e) => setFilters(prev => ({ ...prev, minLongTermScore: parseInt(e.target.value) }))}
                  className="w-full accent-green-600"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-red-600 dark:text-red-400 font-medium">Short-Term</span>
                  <span className="text-gray-500">{filters.minShortTermScore > 0 ? `${filters.minShortTermScore}+` : 'Any'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="5"
                  value={filters.minShortTermScore}
                  onChange={(e) => setFilters(prev => ({ ...prev, minShortTermScore: parseInt(e.target.value) }))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
