import { StockData, StockWithScores, FilterOptions, InvestmentType } from './types'
import { mockStocksData } from './mockData'
import { calculateStockScores } from './scoring'
import { generateAIExplanation } from './explanations'

// Cache for computed stock data
let cachedStocksWithScores: StockWithScores[] | null = null

// ==================== DATA PROCESSING ====================

function processStockData(stock: StockData): StockWithScores {
  const scores = calculateStockScores(stock)
  const explanation = generateAIExplanation(scores)
  
  return {
    ...stock,
    scores,
    explanation
  }
}

function getProcessedStocks(): StockWithScores[] {
  // Return cached data if available
  if (cachedStocksWithScores) {
    return cachedStocksWithScores
  }
  
  // Process all stocks and cache
  cachedStocksWithScores = mockStocksData.map(processStockData)
  return cachedStocksWithScores
}

// ==================== PUBLIC API ====================

/**
 * Get all stocks with computed scores and explanations
 */
export function getAllStocks(): StockWithScores[] {
  return getProcessedStocks()
}

/**
 * Get a single stock by ID
 */
export function getStockById(id: string): StockWithScores | undefined {
  const stocks = getProcessedStocks()
  return stocks.find(stock => stock.id === id)
}

/**
 * Get top N stocks by long-term score
 */
export function getTopLongTermStocks(limit: number = 5): StockWithScores[] {
  const stocks = getProcessedStocks()
  return stocks
    .sort((a, b) => b.scores.longTermScore - a.scores.longTermScore)
    .slice(0, limit)
}

/**
 * Get top N stocks by short-term score
 */
export function getTopShortTermStocks(limit: number = 5): StockWithScores[] {
  const stocks = getProcessedStocks()
  return stocks
    .sort((a, b) => b.scores.shortTermScore - a.scores.shortTermScore)
    .slice(0, limit)
}

/**
 * Filter stocks based on criteria
 */
export function filterStocks(options: FilterOptions): StockWithScores[] {
  let stocks = getProcessedStocks()
  
  // Filter by sector
  if (options.sector && options.sector !== 'All') {
    stocks = stocks.filter(stock => stock.sector === options.sector)
  }
  
  // Filter by investment type
  if (options.investmentType !== 'all') {
    stocks = stocks.filter(stock => {
      if (options.investmentType === 'long-term') {
        return stock.scores.longTermScore >= 70
      }
      if (options.investmentType === 'short-term') {
        return stock.scores.shortTermScore >= 70
      }
      return true
    })
  }
  
  // Filter by market cap range
  if (options.minMarketCap !== undefined) {
    stocks = stocks.filter(stock => stock.marketCap >= options.minMarketCap!)
  }
  if (options.maxMarketCap !== undefined) {
    stocks = stocks.filter(stock => stock.marketCap <= options.maxMarketCap!)
  }
  
  // Sort
  stocks = sortStocks(stocks, options.sortBy)
  
  return stocks
}

/**
 * Sort stocks by specified option
 */
export function sortStocks(stocks: StockWithScores[], sortBy: string): StockWithScores[] {
  const sorted = [...stocks]
  
  switch (sortBy) {
    case 'long-term':
      return sorted.sort((a, b) => b.scores.longTermScore - a.scores.longTermScore)
    
    case 'short-term':
      return sorted.sort((a, b) => b.scores.shortTermScore - a.scores.shortTermScore)
    
    case 'price':
      return sorted.sort((a, b) => b.currentPrice - a.currentPrice)
    
    case 'change':
      return sorted.sort((a, b) => b.priceChange - a.priceChange)
    
    default:
      return sorted
  }
}

/**
 * Get unique sectors from all stocks
 */
export function getAvailableSectors(): string[] {
  const stocks = getProcessedStocks()
  const sectors = new Set(stocks.map(stock => stock.sector))
  return ['All', ...Array.from(sectors).sort()]
}

/**
 * Get market cap ranges for filtering
 */
export function getMarketCapRanges(): { label: string; min?: number; max?: number }[] {
  return [
    { label: 'All', min: undefined, max: undefined },
    { label: 'Small Cap (< 20B)', min: 0, max: 20000 },
    { label: 'Mid Cap (20B - 50B)', min: 20000, max: 50000 },
    { label: 'Large Cap (50B - 100B)', min: 50000, max: 100000 },
    { label: 'Mega Cap (> 100B)', min: 100000, max: undefined }
  ]
}

/**
 * Search stocks by symbol or name
 */
export function searchStocks(query: string): StockWithScores[] {
  if (!query || query.trim() === '') {
    return getProcessedStocks()
  }
  
  const searchTerm = query.toLowerCase().trim()
  const stocks = getProcessedStocks()
  
  return stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm) ||
    stock.name.toLowerCase().includes(searchTerm)
  )
}

/**
 * Clear the cache (useful for testing or data refresh)
 */
export function clearCache(): void {
  cachedStocksWithScores = null
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
