import { Stock } from '@/components/StockCard'

export interface MarketOverview {
  totalStocks: number
  marketsUp: number
  marketsDown: number
  totalVolume: string
  lastUpdated: string
}

export const mockMarketOverview: MarketOverview = {
  totalStocks: 287,
  marketsUp: 143,
  marketsDown: 121,
  totalVolume: 'Rs. 1.2B',
  lastUpdated: '2026-02-01'
}

export const mockLongTermStocks: Stock[] = [
  {
    id: '1',
    symbol: 'JKH',
    name: 'John Keells Holdings PLC',
    sector: 'Diversified',
    longTermScore: 87,
    price: 145.50,
    change: 2.3
  },
  {
    id: '2',
    symbol: 'COMB',
    name: 'Commercial Bank of Ceylon PLC',
    sector: 'Banking',
    longTermScore: 82,
    price: 95.75,
    change: 1.5
  },
  {
    id: '3',
    symbol: 'NDB',
    name: 'National Development Bank PLC',
    sector: 'Banking',
    longTermScore: 79,
    price: 78.25,
    change: 0.8
  },
  {
    id: '4',
    symbol: 'DIAL',
    name: 'Dialog Axiata PLC',
    sector: 'Telecommunications',
    longTermScore: 76,
    price: 12.40,
    change: -0.4
  },
  {
    id: '5',
    symbol: 'LOLC',
    name: 'LOLC Holdings PLC',
    sector: 'Finance',
    longTermScore: 74,
    price: 285.00,
    change: 1.2
  }
]

export const mockShortTermStocks: Stock[] = [
  {
    id: '6',
    symbol: 'SAMP',
    name: 'Sampath Bank PLC',
    sector: 'Banking',
    shortTermScore: 91,
    price: 68.50,
    change: 8.5
  },
  {
    id: '7',
    symbol: 'CTC',
    name: 'Ceylon Tobacco Company PLC',
    sector: 'Manufacturing',
    shortTermScore: 88,
    price: 1250.00,
    change: 5.7
  },
  {
    id: '8',
    symbol: 'LIOC',
    name: 'Lanka IOC PLC',
    sector: 'Energy',
    shortTermScore: 85,
    price: 45.75,
    change: 12.3
  },
  {
    id: '9',
    symbol: 'HNB',
    name: 'Hatton National Bank PLC',
    sector: 'Banking',
    shortTermScore: 83,
    price: 185.25,
    change: 6.9
  },
  {
    id: '10',
    symbol: 'HEMAS',
    name: 'Hemas Holdings PLC',
    sector: 'Healthcare',
    shortTermScore: 80,
    price: 58.00,
    change: 4.2
  }
]

export const mockAllStocks: Stock[] = [
  ...mockLongTermStocks.map(stock => ({
    ...stock,
    shortTermScore: Math.floor(Math.random() * 30) + 40
  })),
  ...mockShortTermStocks.map(stock => ({
    ...stock,
    longTermScore: Math.floor(Math.random() * 30) + 40
  }))
]
