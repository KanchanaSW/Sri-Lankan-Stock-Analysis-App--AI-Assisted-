// Core data types for the Sri Lankan Stock Analysis App

export interface OHLCData {
  date: string // ISO date string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockData {
  id: string
  symbol: string
  name: string
  sector: string
  marketCap: number // in millions
  currentPrice: number
  priceChange: number // percentage
  weekHigh52: number
  weekLow52: number
  historicalData: OHLCData[]
}

export interface SectorData {
  name: string
  averagePerformance: number // percentage
  stockCount: number
  trending: 'up' | 'down' | 'stable'
}

export interface ScoreFactors {
  priceVolatility: number
  trendConsistency: number
  volumeStability: number
  sectorStrength: number
  marketCapStability: number
}

export interface MomentumFactors {
  volumeChange: number
  priceMomentum: number
  breakoutDetection: number
  trendAcceleration: number
}

export interface StockScores {
  longTermScore: number
  shortTermScore: number
  longTermFactors: ScoreFactors
  shortTermFactors: MomentumFactors
}

export interface AIExplanation {
  summary: string
  longTermAnalysis: string
  shortTermAnalysis: string
  riskLevel: 'Low' | 'Medium' | 'High'
  riskReasoning: string
  keyStrengths: string[]
  keyConcerns: string[]
  generatedAt?: number  // Timestamp when AI explanation was generated (only for Grok-powered explanations)
}

export interface StockWithScores extends StockData {
  scores: StockScores
  explanation: AIExplanation
}

export interface MarketOverview {
  totalStocks: number
  marketsUp: number
  marketsDown: number
  totalVolume: string
  lastUpdated: string
}

export type InvestmentType = 'all' | 'long-term' | 'short-term'
export type SortOption = 'long-term' | 'short-term' | 'price' | 'change'

export interface FilterOptions {
  sector: string
  investmentType: InvestmentType
  sortBy: SortOption
  minMarketCap?: number
  maxMarketCap?: number
}
