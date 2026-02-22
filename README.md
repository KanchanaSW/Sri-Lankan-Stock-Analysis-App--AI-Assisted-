# 🇱🇰 Sri Lankan Stock Analysis App

A web-based platform that analyzes Colombo Stock Exchange (CSE) data and presents AI-assisted insights for three tiers of investing: very long-term buy-and-hold, long-term stability, and short-term momentum opportunities.

**🌐 Live Demo:** [slstocks.netlify.app](https://slstocks.netlify.app)

## ✨ Features

- **Dynamic Stock Discovery**: Automatically fetches the top 50 most profitable stocks (highest net income) from TradingView
- **Real-Time Stock Data**: Live prices from TradingView's CSE feed
- **Market Overview**: Summary of market statistics and trends
- **Very Long-Term Analysis**: Identify exceptional stocks for 5-year+ buy-and-hold strategies
- **Long-Term Analysis**: Find stable stocks suitable for long-term holding
- **Short-Term Opportunities**: Identify high-momentum stocks for active trading
- **AI-Assisted Insights**: Groq AI-powered analysis (Llama 3.3 70B) for top picks with context-aware explanations
- **Interactive Charts**: Historical price and volume visualization (Recharts) with **simulated historical data** for trend analysis
- **Advanced Filtering**: Filter stocks by sector, investment type, and market cap
- **Performance Optimized**: Pre-computed scoring and data processing performed server-side for instant page loads
- **Atomic Updates**: Robust data scraping with single-transaction database updates via GitHub Actions

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS |
| **Backend** | Convex (Real-time database) |
| **AI Analysis** | Groq API (Llama 3.3 70B) |
| **Charts** | Recharts |
| **Data Source** | TradingView Scanner API (Live prices + Simulated OHLC) |
| **Hosting** | Netlify |
| **Automation** | GitHub Actions (Daily scraper) |

## 📊 Tracked Stocks

The app automatically tracks the **top 50 most profitable stocks** (by net income) on the Colombo Stock Exchange (CSE). The stock list is dynamically updated based on net income, ensuring you always see financially strong companies with proven profitability.

**Stock Selection Criteria:**
- ✅ Highest net income (most profitable companies)
- ✅ Real-time data from TradingView
- ✅ Automatically refreshed daily
- ✅ Includes metadata: sector, market cap, 52-week high/low, and 5-year performance

**Classification by Scoring:**
- **Very Long-Term Picks**: High quality 5-year+ candidates (Score ≥ 70)
- **Long-Term Picks**: Stocks with stability score ≥ 70
- **Short-Term Picks**: Stocks with momentum score ≥ 70

The stock list refreshes automatically via the daily scraper, focusing on companies that demonstrate strong financial performance and real profitability - the foundation of sustainable investing.

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
GROQ_API_KEY=your-groq-api-key  # Required for AI-powered analysis
```

**📝 Note**: AI-powered analysis requires a `GROQ_API_KEY`. Without it, the app falls back to template-based explanations for all stocks.

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
│   ├── scoring.ts                # Stock scoring algorithms
│   ├── grokService.ts            # Groq AI Service integration
│   ├── explanations.ts           # Template-based explanation generator
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

### Very Long-Term (Buy & Hold) Score (0-100)
Evaluates stocks for extreme long-term holding (5+ years):
- 5-Year Performance (40%)
- 1-Year Performance (15%)
- Price to 52-Week High (15%)
- Market Cap Size (15%)
- Downside Volatility (15%)

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

## 🤖 AI-Powered Analysis (Groq)

The **Top 5 Long-Term Picks** shown on the home page receive enhanced AI-generated analysis powered by Groq's high-speed Llama 3.3 70B model.

### Key AI Features
- **Context-Aware Summaries**: Deep understanding of current market data
- **Three-Tier Analysis**: Individual perspectives for Very Long-Term, Long-Term, and Short-Term
- **Detailed Risk Assessment**: Reasoning-backed risk levels
- **Strengths & Concerns**: Automatically identifies key investment factors

### How It Works
1. Daily scraper identifies Top 5 stocks by Long-Term Stability Score.
2. If `GROQ_API_KEY` is present, the Groq API analyzes each of these stocks.
3. Analysis results are stored in Convex for instant retrieval.
4. Other stocks use logical template-based explanations defined in `lib/explanations.ts`.

## 🔄 Automated Updates

The scraper runs automatically via GitHub Actions ensuring high data integrity:
- **Schedule**: Daily at 3:00 PM Sri Lanka time (weekdays)
- **Process**: 
  1. **Discovery**: Identifies top 50 most profitable stocks (by net income)
  2. **In-Memory Transformation**: Generates historical OHLC data and calculates all three scores locally
  3. **AI Generation**: Fetches Groq AI analysis for top picks
  4. **Atomic Update**: Performs a single `replaceAllStocks` transaction in Convex to avoid data inconsistencies
- **Manual trigger**: `npm run scrape`

## 🚀 Deployment

### Netlify (Frontend)
1. Connect repository to Netlify
2. Set `NEXT_PUBLIC_CONVEX_URL` and `GROQ_API_KEY` environment variables
3. Deploy automatically on push

### GitHub Actions (Scraper)
Add repository secrets:
- `CONVEX_URL` (Required)
- `GROQ_API_KEY` (Required for AI generation)

## ⚠️ Disclaimer

**Data Simulation Notice**: Historical price and volume charts on this platform are computationally generated using mathematical volatility models based on current market metrics. They do not represent exact historical CSE records and are intended for trend visualization and educational purposes only.

This platform provides stock market analysis for **educational purposes only** and does not constitute financial or investment advice. Always consult with a qualified financial advisor before making investment decisions.

## 📄 License

This project is for educational and portfolio purposes.

---

Built with ❤️ for the Sri Lankan investment community

