import { StockData, OHLCData, ScoreFactors, MomentumFactors, StockScores, SectorData, VeryLongTermFactors } from './types'

// Sector performance lookup (can be updated with real data)
const sectorPerformance: Record<string, number> = {
  'Banking': 5.2,
  'Finance': 4.8,
  'Diversified': 6.1,
  'Manufacturing': 3.5,
  'Telecommunications': 2.1,
  'Energy': 8.3,
  'Healthcare': 4.2,
  'Consumer Goods': 3.8,
}

function getSectorPerformance(sectorName: string): number {
  return sectorPerformance[sectorName] ?? 3.0 // Default neutral performance
}

// ==================== UTILITY FUNCTIONS ====================

function calculateReturns(data: OHLCData[]): number[] {
  const returns: number[] = []
  for (let i = 1; i < data.length; i++) {
    const dailyReturn = (data[i].close - data[i - 1].close) / data[i - 1].close
    returns.push(dailyReturn)
  }
  return returns
}

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function calculateRSquared(data: OHLCData[]): number {
  if (data.length < 2) return 0

  const prices = data.map(d => d.close)
  const n = prices.length
  const xValues = Array.from({ length: n }, (_, i) => i)

  // Calculate means
  const meanX = calculateMean(xValues)
  const meanY = calculateMean(prices)

  // Calculate slope and intercept
  let numerator = 0
  let denominator = 0
  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - meanX) * (prices[i] - meanY)
    denominator += Math.pow(xValues[i] - meanX, 2)
  }
  const slope = numerator / denominator
  const intercept = meanY - slope * meanX

  // Calculate R-squared
  let ssRes = 0
  let ssTot = 0
  for (let i = 0; i < n; i++) {
    const predicted = slope * xValues[i] + intercept
    ssRes += Math.pow(prices[i] - predicted, 2)
    ssTot += Math.pow(prices[i] - meanY, 2)
  }

  return 1 - (ssRes / ssTot)
}

function coefficientOfVariation(values: number[]): number {
  const mean = calculateMean(values)
  if (mean === 0) return 0
  const stdDev = calculateStandardDeviation(values)
  return stdDev / mean
}

function normalizeToScore(value: number, min: number, max: number, invert: boolean = false): number {
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return invert ? (1 - normalized) * 100 : normalized * 100
}

// ==================== LONG-TERM STABILITY SCORE ====================

function calculatePriceVolatility(data: OHLCData[]): number {
  const returns = calculateReturns(data)
  const volatility = calculateStandardDeviation(returns)

  // Lower volatility = higher score (invert)
  // Typical daily volatility ranges from 0.01 (1%) to 0.05 (5%)
  return normalizeToScore(volatility, 0.01, 0.05, true)
}

function calculateTrendConsistency(data: OHLCData[]): number {
  const rSquared = calculateRSquared(data)

  // Higher R-squared = more consistent trend
  // R-squared ranges from 0 to 1
  return normalizeToScore(rSquared, 0, 1, false)
}

function calculateVolumeStability(data: OHLCData[]): number {
  const volumes = data.map(d => d.volume)
  const cv = coefficientOfVariation(volumes)

  // Lower coefficient of variation = more stable
  // Typical CV ranges from 0.3 to 1.5
  return normalizeToScore(cv, 0.3, 1.5, true)
}

function calculateSectorStrength(sectorName: string): number {
  const performance = getSectorPerformance(sectorName)

  // Convert sector performance to score
  // Performance ranges from -5% to +10%
  return normalizeToScore(performance, -5, 10, false)
}

function calculateMarketCapStability(data: OHLCData[], currentMarketCap: number): number {
  // Market cap fluctuates with price
  const prices = data.map(d => d.close)
  const priceChanges = prices.map((p, i) => i === 0 ? 0 : Math.abs(p - prices[i - 1]) / prices[i - 1])
  const avgChange = calculateMean(priceChanges)

  // Lower average change = more stable
  // Typical range 0.01 to 0.04
  return normalizeToScore(avgChange, 0.01, 0.04, true)
}

function calculateLongTermScore(stock: StockData): { score: number; factors: ScoreFactors } {
  const priceVolatility = calculatePriceVolatility(stock.historicalData)
  const trendConsistency = calculateTrendConsistency(stock.historicalData)
  const volumeStability = calculateVolumeStability(stock.historicalData)
  const sectorStrength = calculateSectorStrength(stock.sector)
  const marketCapStability = calculateMarketCapStability(stock.historicalData, stock.marketCap)

  // Weighted average according to PRD
  const score =
    priceVolatility * 0.25 +
    trendConsistency * 0.25 +
    volumeStability * 0.20 +
    sectorStrength * 0.20 +
    marketCapStability * 0.10

  return {
    score: Math.round(score),
    factors: {
      priceVolatility: Math.round(priceVolatility),
      trendConsistency: Math.round(trendConsistency),
      volumeStability: Math.round(volumeStability),
      sectorStrength: Math.round(sectorStrength),
      marketCapStability: Math.round(marketCapStability)
    }
  }
}

// ==================== SHORT-TERM MOMENTUM SCORE ====================

function calculateVolumeChange(data: OHLCData[]): number {
  if (data.length < 20) return 50

  // Compare recent 5 days to previous 15 days
  const recentVolume = data.slice(-5).map(d => d.volume)
  const previousVolume = data.slice(-20, -5).map(d => d.volume)

  const recentAvg = calculateMean(recentVolume)
  const previousAvg = calculateMean(previousVolume)

  const change = (recentAvg - previousAvg) / previousAvg

  // Higher volume change = higher score
  // Range: -0.5 to +2.0 (200% increase)
  return normalizeToScore(change, -0.5, 2.0, false)
}

function calculatePriceMomentum(data: OHLCData[]): number {
  if (data.length < 14) return 50

  // Rate of change over 14 days
  const current = data[data.length - 1].close
  const previous = data[data.length - 14].close
  const roc = (current - previous) / previous

  // Range: -0.15 to +0.15 (15% change)
  return normalizeToScore(roc, -0.15, 0.15, false)
}

function calculateBreakoutDetection(stock: StockData): number {
  const currentPrice = stock.currentPrice
  const range = stock.weekHigh52 - stock.weekLow52

  if (range === 0) return 50

  // Position within 52-week range
  const position = (currentPrice - stock.weekLow52) / range

  // Higher position = potential breakout
  return normalizeToScore(position, 0, 1, false)
}

function calculateTrendAcceleration(data: OHLCData[]): number {
  if (data.length < 30) return 50

  // Calculate recent trend vs older trend
  const recentData = data.slice(-14)
  const olderData = data.slice(-28, -14)

  const recentPrices = recentData.map(d => d.close)
  const olderPrices = olderData.map(d => d.close)

  const recentChange = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0]
  const olderChange = (olderPrices[olderPrices.length - 1] - olderPrices[0]) / olderPrices[0]

  const acceleration = recentChange - olderChange

  // Range: -0.2 to +0.2
  return normalizeToScore(acceleration, -0.2, 0.2, false)
}

function calculateShortTermScore(stock: StockData): { score: number; factors: MomentumFactors } {
  const volumeChange = calculateVolumeChange(stock.historicalData)
  const priceMomentum = calculatePriceMomentum(stock.historicalData)
  const breakoutDetection = calculateBreakoutDetection(stock)
  const trendAcceleration = calculateTrendAcceleration(stock.historicalData)

  // Weighted average according to PRD
  const score =
    volumeChange * 0.30 +
    priceMomentum * 0.30 +
    breakoutDetection * 0.20 +
    trendAcceleration * 0.20

  return {
    score: Math.round(score),
    factors: {
      volumeChange: Math.round(volumeChange),
      priceMomentum: Math.round(priceMomentum),
      breakoutDetection: Math.round(breakoutDetection),
      trendAcceleration: Math.round(trendAcceleration)
    }
  }
}

// ==================== VERY LONG-TERM (BUY & HOLD) SCORE ====================

function calculate5YearPerformance(stock: StockData): number {
  if (stock.perf5Y === undefined) return 50 // Neutral if no data

  // Good 5-year perf ranges from 0 to 100% (or more). 
  // Let's cap the max score at 100% return (i.e. doubled in 5 years).
  // If negative, it scores below 50.
  // We'll map -50% to 0 score, 0% to 50 score, and 100% to 100 score.
  let score = 50 + (stock.perf5Y / 2)
  return Math.max(0, Math.min(100, score))
}

function calculate1YearPerformance(stock: StockData): number {
  if (stock.perfY === undefined) return 50 // Neutral if no data

  // Good 1-year perf.
  // We'll map -25% to 0 score, 0% to 50 score, and 50% to 100 score.
  let score = 50 + (stock.perfY * 1)
  return Math.max(0, Math.min(100, score))
}

function calculatePriceToHigh52(stock: StockData): number {
  const currentPrice = stock.currentPrice
  const high52 = stock.weekHigh52

  if (high52 === 0) return 50

  // Ratio of current price to 52-week high
  const ratio = currentPrice / high52
  // Higher ratio (closer to 52-week high) = better for long-term hold strength
  return normalizeToScore(ratio, 0.5, 1.0, false)
}

function calculateMarketCapSize(stock: StockData): number {
  // Larger cap implies more stability for very long term
  // Typical CSE market caps in millions: 5,000 to 200,000+
  // We use a log scale so huge caps don't completely skew it
  const cap = Math.max(1, stock.marketCap)
  const logCap = Math.log10(cap)

  // Log 10,000 = 4, Log 100,000 = 5
  return normalizeToScore(logCap, 3.5, 5.5, false)
}

function calculateDownsideVolatility(data: OHLCData[]): number {
  if (data.length === 0) return 50

  const returns = calculateReturns(data)
  // Only look at negative returns
  const negativeReturns = returns.filter(r => r < 0)

  if (negativeReturns.length === 0) return 100

  const avgDownside = calculateMean(negativeReturns)
  // Penalize large negative average downside
  // -0.005 (-0.5%) to -0.03 (-3%)
  return normalizeToScore(Math.abs(avgDownside), 0.005, 0.03, true)
}

function calculateVeryLongTermScore(stock: StockData): { score: number; factors: VeryLongTermFactors } {
  const fiveYearPerformance = calculate5YearPerformance(stock)
  const oneYearPerformance = calculate1YearPerformance(stock)
  const priceToHigh52 = calculatePriceToHigh52(stock)
  const marketCapSize = calculateMarketCapSize(stock)
  const downsideVolatility = calculateDownsideVolatility(stock.historicalData)

  // Weighted average for "Very Long Term / Buy & Hold"
  const score =
    fiveYearPerformance * 0.40 + // Heaviest weight on actual 5y performance
    oneYearPerformance * 0.15 +
    priceToHigh52 * 0.15 +
    marketCapSize * 0.15 +
    downsideVolatility * 0.15

  return {
    score: Math.round(score),
    factors: {
      fiveYearPerformance: Math.round(fiveYearPerformance),
      oneYearPerformance: Math.round(oneYearPerformance),
      priceToHigh52: Math.round(priceToHigh52),
      marketCapSize: Math.round(marketCapSize),
      downsideVolatility: Math.round(downsideVolatility)
    }
  }
}

// ==================== MAIN EXPORT ====================

export function calculateStockScores(stock: StockData): StockScores {
  const longTerm = calculateLongTermScore(stock)
  const shortTerm = calculateShortTermScore(stock)
  const veryLongTerm = calculateVeryLongTermScore(stock)

  return {
    longTermScore: longTerm.score,
    shortTermScore: shortTerm.score,
    veryLongTermScore: veryLongTerm.score,
    longTermFactors: longTerm.factors,
    shortTermFactors: shortTerm.factors,
    veryLongTermFactors: veryLongTerm.factors
  }
}

// Export individual calculators for testing/debugging
export {
  calculatePriceVolatility,
  calculateTrendConsistency,
  calculateVolumeStability,
  calculateSectorStrength,
  calculateMarketCapStability,
  calculateVolumeChange,
  calculatePriceMomentum,
  calculateBreakoutDetection,
  calculateTrendAcceleration
}
