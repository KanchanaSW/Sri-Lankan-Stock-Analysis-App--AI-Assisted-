import { StockWithScores } from './types'

// ==================== MARKET CAP RANGES ====================

export interface MarketCapRange {
  label: string;
  min?: number;
  max?: number;
}

/**
 * Get market cap ranges for filtering
 */
export function getMarketCapRanges(): MarketCapRange[] {
  return [
    { label: 'All', min: undefined, max: undefined },
    { label: 'Small Cap (< 20B)', min: 0, max: 20000 },
    { label: 'Mid Cap (20B - 50B)', min: 20000, max: 50000 },
    { label: 'Large Cap (50B - 100B)', min: 50000, max: 100000 },
    { label: 'Mega Cap (> 100B)', min: 100000, max: undefined }
  ]
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format market cap to readable string
 */
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000000) {
    return `Rs. ${(marketCap / 1000000).toFixed(1)}T`
  }
  if (marketCap >= 1000) {
    return `Rs. ${(marketCap / 1000).toFixed(1)}B`
  }
  return `Rs. ${marketCap.toFixed(0)}M`
}

/**
 * Format price with currency
 */
export function formatPrice(price: number): string {
  return `Rs. ${price.toFixed(2)}`
}

/**
 * Format percentage change
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

/**
 * Get color class for score
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-600'
}

/**
 * Get background color class for score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-50'
  if (score >= 60) return 'bg-blue-50'
  if (score >= 40) return 'bg-amber-50'
  return 'bg-red-50'
}
