# 🇱🇰 Sri Lankan Stock Analysis App

A web-based platform that analyzes Colombo Stock Exchange (CSE) data and presents AI-assisted insights for long-term investing and short-term trading opportunities.

**🌐 Live Demo:** [slstocks.netlify.app](https://slstocks.netlify.app)

## ✨ Features

- **Dynamic Stock Discovery**: Automatically fetches the top 50 most active stocks from TradingView
- **Real-Time Stock Data**: Live prices from TradingView's CSE feed
- **Market Overview**: Summary of market statistics and trends
- **Long-Term Analysis**: Identify stable stocks suitable for long-term holding
- **Short-Term Opportunities**: Find high-momentum stocks for active trading
- **AI-Assisted Insights**: Plain-English explanations of stock classifications
- **Interactive Charts**: Historical price and volume visualization (Recharts)
- **Advanced Filtering**: Filter stocks by sector, investment type, and market cap
- **Automated Updates**: Daily stock list and price updates via GitHub Actions

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS |
| **Backend** | Convex (Real-time database) |
| **Charts** | Recharts |
| **Data Source** | TradingView Scanner API |
| **Hosting** | Netlify |
| **Automation** | GitHub Actions (Daily scraper) |

## 📊 Tracked Stocks

The app automatically tracks the **top 50 most actively traded stocks** on the Colombo Stock Exchange (CSE). The stock list is dynamically updated based on trading volume, ensuring you always see the most relevant and liquid stocks.

**Stock Selection Criteria:**
- ✅ Highest trading volume (most active)
- ✅ Real-time data from TradingView
- ✅ Automatically refreshed daily
- ✅ Includes metadata: sector, market cap, 52-week high/low

**Classification by AI Scoring:**
- **Long-Term Picks**: Stocks with stability score ≥ 70
- **Short-Term Picks**: Stocks with momentum score ≥ 70

The stock list refreshes automatically via the daily scraper, so the app adapts to market trends and trading activity.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Convex account ([convex.dev](https://convex.dev))

### Installation

```bash
# Clone the repository
git clone https://github.com/KanchanaSW/Sri-Lankan-Stock-Analysis-App--AI-Assisted-.git
cd "Sri Lankan Stock Analysis App (AI-Assisted)"

# Install dependencies
npm install

# Set up Convex
npx convex dev
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_CONVEX_URL=your-convex-deployment-url
CONVEX_URL=your-convex-deployment-url
```

### Development

```bash
# Terminal 1: Start Convex backend
npm run dev:convex

# Terminal 2: Start Next.js frontend
npm run dev

# Seed the database (first time only)
npm run seed

# Fetch latest stock prices
npm run scrape
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/
│   ├── ConvexClientProvider.tsx  # Convex React provider
│   ├── globals.css               # Global styles & Tailwind
│   ├── layout.tsx                # Root layout with header
│   ├── page.tsx                  # Home page
│   └── stocks/
│       ├── page.tsx              # Stock list with filters
│       └── [id]/page.tsx         # Stock detail page
├── components/
│   ├── charts/
│   │   ├── PriceChart.tsx        # Historical price chart
│   │   └── VolumeChart.tsx       # Trading volume chart
│   ├── DisclaimerBanner.tsx      # Legal disclaimer
│   ├── Header.tsx                # Navigation header
│   ├── LoadingSkeleton.tsx       # Loading states
│   ├── RiskIndicator.tsx         # Risk level display
│   ├── ScoreBadge.tsx            # Score visualization
│   ├── ScoreBreakdown.tsx        # Detailed score factors
│   └── StockCard.tsx             # Stock display card
├── convex/
│   ├── mutations.ts              # Database mutations
│   ├── queries.ts                # Database queries
│   ├── schema.ts                 # Database schema
│   ├── seed.ts                   # Seed data script
│   └── stocks.ts                 # Stock-specific queries
├── lib/
│   ├── config.ts                 # App configuration
│   ├── convexService.ts          # Convex React hooks
│   ├── explanations.ts           # AI explanation generator
│   ├── scoring.ts                # Stock scoring algorithms
│   ├── stockService.ts           # Utility functions
│   ├── stockSymbols.ts           # Symbol format utilities
│   └── types.ts                  # TypeScript types
├── scripts/
│   └── scrapeTradingView.ts      # Dynamic stock discovery + price scraper
├── .github/workflows/
│   └── scrape-stocks.yml         # Automated daily scraper
├── netlify.toml                  # Netlify configuration
└── package.json
```

## 📈 Scoring System

### Long-Term Stability Score (0-100)
Evaluates stocks for buy-and-hold investing based on:
- Price Volatility (25%)
- Trend Consistency (25%)
- Volume Stability (20%)
- Sector Strength (20%)
- Market Cap Stability (10%)

### Short-Term Momentum Score (0-100)
Identifies trading opportunities based on:
- Volume Change (30%)
- Price Momentum (30%)
- Breakout Detection (20%)
- Trend Acceleration (20%)

## 🔄 Automated Stock Discovery & Updates

The scraper runs automatically via GitHub Actions:
- **Schedule**: Daily at 3:00 PM Sri Lanka time (weekdays)
- **Process**: 
  1. Discovers top 50 most active stocks from TradingView
  2. Fetches current prices, 52-week high/low, sector data
  3. Replaces entire stock database with fresh data
  4. App automatically classifies stocks by scoring algorithms
- **Source**: TradingView Scanner API
- **Manual trigger**: `npm run scrape`

This ensures the app always shows the most actively traded and relevant stocks, adapting to market trends automatically.

## 🚀 Deployment

### Netlify (Frontend)

1. Connect your GitHub repository to Netlify
2. Set environment variable: `NEXT_PUBLIC_CONVEX_URL`
3. Deploy automatically on push

### GitHub Actions (Scraper)

Add repository secret: `CONVEX_URL`

## ⚠️ Disclaimer

This platform provides stock market analysis for **educational purposes only** and does not constitute financial or investment advice. Always consult with a qualified financial advisor before making investment decisions.

## 📄 License

This project is for educational and portfolio purposes.

---

Built with ❤️ for the Sri Lankan investment community
