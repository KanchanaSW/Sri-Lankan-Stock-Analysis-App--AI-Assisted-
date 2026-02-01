import { StockData, OHLCData, SectorData, MarketOverview } from './types'

// Sector data with performance metrics
export const sectorData: SectorData[] = [
  { name: 'Banking', averagePerformance: 5.2, stockCount: 12, trending: 'up' },
  { name: 'Finance', averagePerformance: 4.8, stockCount: 15, trending: 'up' },
  { name: 'Diversified', averagePerformance: 6.1, stockCount: 8, trending: 'up' },
  { name: 'Manufacturing', averagePerformance: 3.5, stockCount: 20, trending: 'stable' },
  { name: 'Telecommunications', averagePerformance: 2.1, stockCount: 3, trending: 'down' },
  { name: 'Energy', averagePerformance: 8.3, stockCount: 6, trending: 'up' },
  { name: 'Healthcare', averagePerformance: 4.2, stockCount: 10, trending: 'stable' },
  { name: 'Consumer Goods', averagePerformance: 3.8, stockCount: 18, trending: 'stable' }
]

// Helper function to generate realistic OHLC data
function generateHistoricalData(
  basePrice: number,
  days: number,
  volatility: number,
  trend: number
): OHLCData[] {
  const data: OHLCData[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  let currentPrice = basePrice * 0.85 // Start 15% lower for growth
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue
    }
    
    // Add trend and random walk
    const trendChange = trend * currentPrice
    const randomChange = (Math.random() - 0.5) * volatility * currentPrice
    currentPrice = currentPrice + trendChange + randomChange
    
    // Generate OHLC
    const dailyVolatility = volatility * currentPrice * 0.5
    const open = currentPrice + (Math.random() - 0.5) * dailyVolatility
    const close = currentPrice + (Math.random() - 0.5) * dailyVolatility
    const high = Math.max(open, close) + Math.random() * dailyVolatility * 0.5
    const low = Math.min(open, close) - Math.random() * dailyVolatility * 0.5
    const volume = Math.floor((500000 + Math.random() * 1000000) * (1 + Math.random() * 0.5))
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.max(0.01, open),
      high: Math.max(0.01, high),
      low: Math.max(0.01, low),
      close: Math.max(0.01, close),
      volume
    })
  }
  
  return data
}

// Mock stock data with full historical data
export const mockStocksData: StockData[] = [
  {
    id: '1',
    symbol: 'JKH',
    name: 'John Keells Holdings PLC',
    sector: 'Diversified',
    marketCap: 85000, // 85 billion LKR = 85,000 million
    currentPrice: 145.50,
    priceChange: 2.3,
    weekHigh52: 165.00,
    weekLow52: 115.20,
    historicalData: generateHistoricalData(145.50, 365, 0.015, 0.0003) // Low volatility, slight uptrend
  },
  {
    id: '2',
    symbol: 'COMB',
    name: 'Commercial Bank of Ceylon PLC',
    sector: 'Banking',
    marketCap: 42000,
    currentPrice: 95.75,
    priceChange: 1.5,
    weekHigh52: 108.50,
    weekLow52: 78.00,
    historicalData: generateHistoricalData(95.75, 365, 0.018, 0.0002)
  },
  {
    id: '3',
    symbol: 'NDB',
    name: 'National Development Bank PLC',
    sector: 'Banking',
    marketCap: 28500,
    currentPrice: 78.25,
    priceChange: 0.8,
    weekHigh52: 88.00,
    weekLow52: 65.50,
    historicalData: generateHistoricalData(78.25, 365, 0.020, 0.0002)
  },
  {
    id: '4',
    symbol: 'DIAL',
    name: 'Dialog Axiata PLC',
    sector: 'Telecommunications',
    marketCap: 95000,
    currentPrice: 12.40,
    priceChange: -0.4,
    weekHigh52: 14.80,
    weekLow52: 10.20,
    historicalData: generateHistoricalData(12.40, 365, 0.022, -0.0001) // Slight downtrend
  },
  {
    id: '5',
    symbol: 'LOLC',
    name: 'LOLC Holdings PLC',
    sector: 'Finance',
    marketCap: 72000,
    currentPrice: 285.00,
    priceChange: 1.2,
    weekHigh52: 310.00,
    weekLow52: 245.00,
    historicalData: generateHistoricalData(285.00, 365, 0.019, 0.0002)
  },
  {
    id: '6',
    symbol: 'SAMP',
    name: 'Sampath Bank PLC',
    sector: 'Banking',
    marketCap: 35000,
    currentPrice: 68.50,
    priceChange: 8.5,
    weekHigh52: 72.00,
    weekLow52: 48.20,
    historicalData: generateHistoricalData(68.50, 365, 0.035, 0.0008) // High volatility, strong uptrend
  },
  {
    id: '7',
    symbol: 'CTC',
    name: 'Ceylon Tobacco Company PLC',
    sector: 'Manufacturing',
    marketCap: 125000,
    currentPrice: 1250.00,
    priceChange: 5.7,
    weekHigh52: 1280.00,
    weekLow52: 980.00,
    historicalData: generateHistoricalData(1250.00, 365, 0.030, 0.0006)
  },
  {
    id: '8',
    symbol: 'LIOC',
    name: 'Lanka IOC PLC',
    sector: 'Energy',
    marketCap: 18000,
    currentPrice: 45.75,
    priceChange: 12.3,
    weekHigh52: 48.00,
    weekLow52: 28.50,
    historicalData: generateHistoricalData(45.75, 365, 0.040, 0.0010) // Very high momentum
  },
  {
    id: '9',
    symbol: 'HNB',
    name: 'Hatton National Bank PLC',
    sector: 'Banking',
    marketCap: 58000,
    currentPrice: 185.25,
    priceChange: 6.9,
    weekHigh52: 195.00,
    weekLow52: 145.00,
    historicalData: generateHistoricalData(185.25, 365, 0.032, 0.0007)
  },
  {
    id: '10',
    symbol: 'HEMAS',
    name: 'Hemas Holdings PLC',
    sector: 'Healthcare',
    marketCap: 25000,
    currentPrice: 58.00,
    priceChange: 4.2,
    weekHigh52: 62.50,
    weekLow52: 45.00,
    historicalData: generateHistoricalData(58.00, 365, 0.028, 0.0005)
  },
  {
    id: '11',
    symbol: 'NEST',
    name: 'Nestle Lanka PLC',
    sector: 'Consumer Goods',
    marketCap: 68000,
    currentPrice: 2850.00,
    priceChange: 1.8,
    weekHigh52: 2950.00,
    weekLow52: 2550.00,
    historicalData: generateHistoricalData(2850.00, 365, 0.016, 0.0002)
  },
  {
    id: '12',
    symbol: 'ТОК',
    name: 'Tokyo Cement Company PLC',
    sector: 'Manufacturing',
    marketCap: 22000,
    currentPrice: 42.50,
    priceChange: -1.2,
    weekHigh52: 52.00,
    weekLow52: 38.00,
    historicalData: generateHistoricalData(42.50, 365, 0.025, 0.0001)
  }
]

export const mockMarketOverview: MarketOverview = {
  totalStocks: 287,
  marketsUp: 143,
  marketsDown: 121,
  totalVolume: 'Rs. 1.2B',
  lastUpdated: '2026-02-01'
}

// Helper to get sector by name
export function getSectorData(sectorName: string): SectorData | undefined {
  return sectorData.find(s => s.name === sectorName)
}

// All available sectors for filtering
export const availableSectors = ['All', ...sectorData.map(s => s.name)]
