# Architecture & Implementation Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL DATA SOURCE                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  TradingView Scanner API                                     │
│  ├── Top 50 stocks by net income (highest profitability)   │
│  ├── Real-time prices & 52-week high/low                   │
│  ├── Sector classification                                  │
│  └── Market cap & volume data                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      SCRAPER LAYER                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  scripts/scrapeTradingView.ts                               │
│  ├── discoverActiveStocks() - Discover top 50 profitable   │
│  ├── fetchTradingViewData() - Get detailed price data      │
│  └── updateAllPrices() - Replace database stocks           │
│                                                               │
│  Runs: Daily at 3:00 PM LKT (GitHub Actions)               │
│  Process: Atomic stock replacement                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER (Convex)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Tables:                                                     │
│  ├── stocks - Core stock data (~50 stocks)                 │
│  │   ├── Basic: symbol, name, sector, marketCap           │
│  │   └── Current: price, change, 52W high/low             │
│  │                                                          │
│  ├── ohlcData - Historical price/volume data               │
│  │   └── OHLC + volume per stock per day                  │
│  │                                                          │
│  ├── sectors - Sector performance metrics                  │
│  │   └── Performance, stock count, trending               │
│  │                                                          │
│  └── marketOverview - Market statistics (singleton)        │
│      └── Total stocks, gainers, losers, volume             │
│                                                               │
│  Mutations:                                                  │
│  ├── replaceAllStocks - Atomic stock replacement           │
│  ├── updateStock - Update individual stock                 │
│  ├── upsertStock - Insert or update by symbol             │
│  └── addOHLCData / batchAddOHLCData                        │
│                                                               │
│  Queries:                                                    │
│  ├── getAllStocks - Fetch all stocks                       │
│  ├── getStockBySymbol - Find by symbol                     │
│  ├── getStockWithHistory - Stock + OHLC data              │
│  └── getMarketOverview - Market statistics                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                     PROCESSING LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  scoring.ts                                                  │
│  ├── Long-Term Score (0-100)                                │
│  │   ├── Price Volatility (25%)                             │
│  │   ├── Trend Consistency (25%)                            │
│  │   ├── Volume Stability (20%)                             │
│  │   ├── Sector Strength (20%)                              │
│  │   └── Market Cap Stability (10%)                         │
│  │                                                           │
│  └── Short-Term Score (0-100)                               │
│      ├── Volume Change (30%)                                │
│      ├── Price Momentum (30%)                               │
│      ├── Breakout Detection (20%)                           │
│      └── Trend Acceleration (20%)                           │
│                                                               │
│  explanations.ts                                             │
│  ├── Analyzes score factors                                 │
│  ├── Generates dynamic text                                 │
│  ├── Calculates risk level                                  │
│  └── Identifies strengths & concerns                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  convexService.ts (React Hooks)                             │
│  ├── useAllStocks() - Subscribe to all stocks              │
│  ├── useStockById() - Subscribe to single stock            │
│  ├── useMarketOverview() - Subscribe to market stats       │
│  ├── getTopLongTermStocksClient() - Sort by LT score       │
│  └── getTopShortTermStocksClient() - Sort by ST score      │
│                                                               │
│  stockService.ts (Utilities)                                │
│  ├── Data Access Functions                                  │
│  ├── Filter & Sort                                           │
│  │   ├── filterStocks(options)                              │
│  │   └── sortStocks(stocks, sortBy)                         │
│  └── Utility Functions                                       │
│      ├── formatMarketCap()                                   │
│      ├── formatPrice()                                       │
│      └── getScoreColor()                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   COMPONENT LAYER                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Shared Components:                                          │
│  ├── Header                - Navigation                      │
│  ├── DisclaimerBanner      - Legal compliance               │
│  ├── StockCard             - Stock display with AI snippet  │
│  ├── ScoreBadge            - Visual score display           │
│  ├── RiskIndicator         - Risk level badge               │
│  ├── LoadingSkeleton       - Loading states                 │
│  └── ScoreBreakdown        - Factor visualization           │
│                                                               │
│  Chart Components:                                           │
│  ├── PriceChart            - Line chart for prices          │
│  └── VolumeChart           - Bar chart for volume           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                       PAGE LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  / (Home)                                                    │
│  ├── Market Overview Stats                                  │
│  ├── Top 5 Long-Term Stocks (highest stability scores)     │
│  └── Top 5 Short-Term Stocks (highest momentum scores)     │
│                                                               │
│  /stocks (Stock List)                                        │
│  ├── 4 Filter Options                                        │
│  │   ├── Sector                                             │
│  │   ├── Investment Type                                    │
│  │   ├── Market Cap Range                                   │
│  │   └── Sort By                                            │
│  └── Grid of Stock Cards                                    │
│                                                               │
│  /stocks/[id] (Stock Detail)                                │
│  ├── Stock Header & Current Price                           │
│  ├── Score Cards (Long-term, Short-term, Risk)             │
│  ├── AI Analysis Section                                    │
│  │   ├── Summary                                            │
│  │   ├── Long-term Analysis                                 │
│  │   ├── Short-term Analysis                                │
│  │   ├── Key Strengths                                      │
│  │   └── Key Concerns                                       │
│  ├── Score Breakdowns (2 panels)                            │
│  ├── Price History Chart                                    │
│  └── Trading Volume Chart                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Daily Update Cycle

```
1. GitHub Actions (3:00 PM LKT)
   ↓
2. Run scripts/scrapeTradingView.ts
   ↓
3. TradingView API → Discover top 50 by net income
   ↓
4. Fetch detailed price data
   ↓
5. Convex: replaceAllStocks mutation
   ↓
6. Delete old stocks + OHLC data
   ↓
7. Insert new stocks
   ↓
8. Next.js App: Real-time updates via Convex subscriptions
   ↓
9. Calculate scores & AI explanations client-side
```

### Stock Selection Criteria

**TradingView API Query:**
- **Endpoint**: `https://scanner.tradingview.com/srilanka/scan`
- **Sort By**: `net_income` (descending)
- **Filter**: Volume > 0, Type = stock/dr
- **Range**: Top 50

**Result**: Most profitable companies on CSE
- Examples: Browns Investments, Commercial Bank, LOLC, HNB, Sampath Bank
- Focus: Blue-chip, established companies with proven profitability

## Scoring Algorithm Details

### Long-Term Stability Score

**1. Price Volatility (25%)**
```
Daily Returns = (Close[i] - Close[i-1]) / Close[i-1]
Standard Deviation = σ(returns)
Score = normalize(σ, 0.01, 0.05) [inverted]
→ Lower volatility = Higher score
```

**2. Trend Consistency (25%)**
```
Linear Regression: price = slope * day + intercept
R² = 1 - (SS_residual / SS_total)
Score = normalize(R², 0, 1)
→ Higher R² = More consistent trend
```

**3. Volume Stability (20%)**
```
Coefficient of Variation = σ(volumes) / mean(volumes)
Score = normalize(CV, 0.3, 1.5) [inverted]
→ Lower CV = More stable volumes
```

**4. Sector Strength (20%)**
```
Sector Performance = sector.averagePerformance
Score = normalize(performance, -5%, +10%)
→ Better sector = Higher score
```

**5. Market Cap Stability (10%)**
```
Price Changes = |price[i] - price[i-1]| / price[i-1]
Average Change = mean(priceChanges)
Score = normalize(avgChange, 0.01, 0.04) [inverted]
→ Lower fluctuation = Higher score
```

### Short-Term Momentum Score

**1. Volume Change (30%)**
```
Recent Volume = mean(last 5 days)
Previous Volume = mean(days 6-20)
Change = (recent - previous) / previous
Score = normalize(change, -0.5, 2.0)
→ Higher volume increase = Higher score
```

**2. Price Momentum (30%)**
```
Rate of Change = (price[today] - price[14 days ago]) / price[14 days ago]
Score = normalize(ROC, -0.15, 0.15)
→ Positive momentum = Higher score
```

**3. Breakout Detection (20%)**
```
Position = (current - 52W_low) / (52W_high - 52W_low)
Score = normalize(position, 0, 1)
→ Near 52W high = Higher score
```

**4. Trend Acceleration (20%)**
```
Recent Trend = (last 14 days change)
Older Trend = (days 15-28 change)
Acceleration = recent - older
Score = normalize(acceleration, -0.2, 0.2)
→ Accelerating uptrend = Higher score
```

## AI Explanation Generation Logic

### Risk Level Calculation
```javascript
avgScore = (longTermScore + shortTermScore) / 2
if (avgScore >= 70) → Low Risk
else if (avgScore >= 55) → Medium Risk
else → High Risk
```

### Text Generation
- **Summary**: Based on dominant classification (long-term vs short-term)
- **Analysis**: Uses strongest and weakest factors
- **Strengths**: Lists factors scoring ≥75
- **Concerns**: Lists factors scoring <40

## Filter & Sort Options

### Filters
```
Sector:         All | Banking | Finance | Diversified | ...
Investment:     All | Long-Term (≥70) | Short-Term (≥70)
Market Cap:     All | Small (<20B) | Mid (20-50B) | Large (50-100B) | Mega (>100B)
```

### Sort Options
```
- Long-Term Score (descending)
- Short-Term Score (descending)
- Price (descending)
- Price Change % (descending)
```

## Performance Characteristics

### Real-Time Updates (Convex)
```javascript
// Convex subscriptions provide real-time data
useAllStocks() // Auto-updates when stocks change
useStockById(id) // Live stock detail updates
useMarketOverview() // Real-time market stats
```

### Client-Side Scoring
- Scores calculated in browser from historical data
- Initial calculation: ~50-100ms per stock (with OHLC data)
- Cached in React state during session
- Re-calculated only on data changes

### Database Performance
- Convex queries: <100ms typically
- Real-time subscriptions: Near-instant updates
- Atomic stock replacement: ~5-10 seconds for 50 stocks
- OHLC data queries: Indexed by stock and date

## File Structure

```
app/
├── ConvexClientProvider.tsx  # Convex React provider
├── layout.tsx                 # Root layout + Header
├── page.tsx                   # Home page
├── globals.css                # Tailwind + custom styles
└── stocks/
    ├── page.tsx               # Stock list with filters
    └── [id]/page.tsx          # Stock detail page

components/
├── DisclaimerBanner.tsx
├── Header.tsx
├── StockCard.tsx              # Stock display with AI snippets
├── ScoreBadge.tsx             # Visual score display
├── RiskIndicator.tsx          # Risk level badge
├── LoadingSkeleton.tsx        # Loading states
├── ScoreBreakdown.tsx         # Factor visualization
└── charts/
    ├── PriceChart.tsx         # Historical price chart
    └── VolumeChart.tsx        # Trading volume chart

convex/
├── _generated/                # Convex auto-generated types
├── schema.ts                  # Database schema definition
├── mutations.ts               # Database mutations
│   ├── replaceAllStocks       # Atomic stock replacement
│   ├── updateStock            # Update individual stock
│   ├── upsertStock            # Insert or update
│   └── addOHLCData            # Historical data
├── queries.ts                 # Database queries
│   ├── getAllStocks
│   ├── getStockBySymbol
│   └── getMarketOverview
├── stocks.ts                  # Stock-specific queries
└── seed.ts                    # Database seeding script

lib/
├── types.ts                   # TypeScript interfaces
├── config.ts                  # App configuration
├── scoring.ts                 # Score calculations
├── explanations.ts            # AI text generation
├── convexService.ts           # Convex React hooks
├── stockService.ts            # Utility functions
└── stockSymbols.ts            # Symbol format utilities

scripts/
└── scrapeTradingView.ts       # Stock discovery & price scraper
    ├── discoverActiveStocks() # Find top 50 by net income
    ├── fetchTradingViewData() # Get detailed data
    └── updateAllPrices()      # Update database

.github/workflows/
└── scrape-stocks.yml          # Daily automated scraper
```

## Type Definitions

### Core Types
```typescript
// Stock data from database
StockData {
  id: string
  symbol: string
  name: string
  sector: string
  marketCap: number
  currentPrice: number
  priceChange: number
  weekHigh52: number
  weekLow52: number
  historicalData: OHLCData[]
}

// Historical price/volume data
OHLCData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Computed scores and factors
StockScores {
  longTermScore: number
  shortTermScore: number
  longTermFactors: ScoreFactors
  shortTermFactors: MomentumFactors
}

// AI-generated explanations
AIExplanation {
  summary: string
  longTermAnalysis: string
  shortTermAnalysis: string
  riskLevel: 'Low' | 'Medium' | 'High'
  riskReasoning: string
  keyStrengths: string[]
  keyConcerns: string[]
}

// Complete stock object with scores
StockWithScores extends StockData {
  scores: StockScores
  explanation: AIExplanation
}
```

### Filter Types
```typescript
InvestmentType = 'all' | 'long-term' | 'short-term'
SortOption = 'long-term' | 'short-term' | 'price' | 'change'

FilterOptions {
  sector: string
  investmentType: InvestmentType
  sortBy: SortOption
  minMarketCap?: number
  maxMarketCap?: number
}
```

### Convex Types
```typescript
// Database IDs
Id<"stocks"> | Id<"ohlcData"> | Id<"sectors"> | Id<"marketOverview">

// Mutation return types
{ deleted: number, inserted: number, stockIds: Id<"stocks">[] }
{ inserted: number, updated: number }
```

## Deployment Architecture

### Frontend (Netlify)
- **Build**: Next.js static site generation
- **Environment**: `NEXT_PUBLIC_CONVEX_URL`
- **Auto-deploy**: On git push to main
- **CDN**: Global edge network

### Backend (Convex)
- **Database**: Real-time cloud database
- **Functions**: Server-side queries & mutations
- **Subscriptions**: WebSocket-based live updates
- **Deployment**: Automatic via `npx convex deploy`

### Automation (GitHub Actions)
- **Workflow**: `.github/workflows/scrape-stocks.yml`
- **Schedule**: Daily at 3:00 PM Sri Lanka Time (weekdays)
- **Environment**: `CONVEX_URL` (repository secret)
- **Process**:
  1. Checkout code
  2. Install dependencies
  3. Run `npm run scrape`
  4. Update Convex database

## Key Features

### 1. Dynamic Stock Discovery
- **Source**: TradingView Scanner API
- **Criteria**: Top 50 by net income (profitability)
- **Update**: Daily automatic refresh
- **Benefits**:
  - Zero maintenance
  - Always current
  - Blue-chip companies
  - Proven profitability

### 2. Real-Time Data
- **Subscriptions**: Convex real-time updates
- **Latency**: <100ms for UI updates
- **Sync**: All clients updated simultaneously
- **Reliability**: Automatic reconnection

### 3. AI-Powered Analysis
- **Long-Term Scoring**: 5 weighted factors
- **Short-Term Scoring**: 4 weighted factors
- **Risk Assessment**: Automated classification
- **Explanations**: Plain-English insights

### 4. Smart Classification
- **Long-Term Picks**: Stability score ≥ 70
- **Short-Term Opportunities**: Momentum score ≥ 70
- **Risk Levels**: Low, Medium, High
- **Auto-Update**: Based on daily data

## Integration Points

### TradingView → Scraper
```typescript
POST https://scanner.tradingview.com/srilanka/scan
Body: {
  sort: { sortBy: "net_income", sortOrder: "desc" },
  range: [0, 50]
}
→ Returns top 50 most profitable stocks
```

### Scraper → Convex
```typescript
client.mutation(api.mutations.replaceAllStocks, {
  stocks: discoveredStocks
})
→ Atomic replacement of stock database
```

### Convex → Next.js
```typescript
const { stocks } = useAllStocks()
→ Real-time subscription to stock changes
```

### Next.js → User
```typescript
// Client-side scoring
const stocksWithScores = stocks.map(stock => ({
  ...stock,
  scores: calculateStockScores(stock),
  explanation: generateExplanation(stock, scores)
}))
→ Rendered in React components
```

## Security Considerations

### API Keys
- **Convex URL**: Public (read access via subscriptions)
- **GitHub Secret**: `CONVEX_URL` for write access
- **No TradingView Auth**: Public API endpoint

### Data Validation
- Input validation in Convex mutations
- Type safety via TypeScript
- Schema enforcement in Convex

### Rate Limiting
- TradingView: Respectful request spacing
- Convex: Built-in rate limiting
- GitHub Actions: Once daily execution

## Monitoring & Maintenance

### What to Monitor
1. **Scraper Success Rate**: Check GitHub Actions logs
2. **Stock Count**: Should be ~50 stocks
3. **Data Freshness**: Last updated timestamp
4. **Error Logs**: Convex dashboard logs
5. **User Metrics**: Netlify analytics

### Maintenance Tasks
1. **Weekly**: Review scraper logs
2. **Monthly**: Check stock quality and diversity
3. **Quarterly**: Update scoring algorithms if needed
4. **As Needed**: Handle TradingView API changes

## Conclusion

The implementation is **production-ready** with:

✅ **Dynamic Stock Discovery** - Top 50 profitable stocks  
✅ **Real-Time Database** - Convex cloud backend  
✅ **Automated Updates** - Daily GitHub Actions  
✅ **AI Scoring** - Weighted algorithms with explanations  
✅ **Advanced Filtering** - Sector, type, market cap  
✅ **Interactive Charts** - Recharts visualizations  
✅ **TypeScript** - Full type safety  
✅ **Responsive UI** - Tailwind CSS  
✅ **Zero Linter Errors** - Clean codebase  
✅ **Global CDN** - Netlify deployment  

### Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + React 18 | App framework |
| Styling | Tailwind CSS | UI design |
| Database | Convex | Real-time backend |
| Data Source | TradingView API | Stock data |
| Charts | Recharts | Visualizations |
| Hosting | Netlify | CDN deployment |
| Automation | GitHub Actions | Daily scraper |
| Language | TypeScript | Type safety |

The system provides a **comprehensive stock analysis platform** focused on **fundamental profitability** and **AI-assisted insights** for Sri Lankan investors.



