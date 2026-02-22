# 🇱🇰 Sri Lankan Stock Analysis App

A web-based platform that analyzes Colombo Stock Exchange (CSE) data and presents AI-assisted insights for three tiers of investing: very long-term buy-and-hold, long-term stability, and short-term momentum opportunities.

**🌐 Live Demo:** [slstocks.netlify.app](https://slstocks.netlify.app)

## ✨ Features

- **Dynamic Stock Discovery**: Automatically fetches the top 50 most profitable stocks (highest net income) from TradingView
- **Real-Time Stock Data**: Live prices from TradingView's CSE feed
- **Market Overview**: Summary of market statistics and trends
- **Very Long-Term Analysis**: Identify exceptional stocks for 5-year+ buy-and-hold strategies with dedicated multi-year metrics
- **Long-Term Analysis**: Find stable stocks suitable for 1-year stability and consistent growth
- **Short-Term Opportunities**: Identify high-momentum stocks for active tactical trading
- **AI-Assisted Insights**: Three-tier context-aware analysis (Very Long-Term, Long-Term, Short-Term) powered by Groq (Llama 3.3 70B)
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
| **Automation** | Convex Cron Jobs (Weekly scraper) |

## 📊 Tracked Stocks

The app automatically tracks the **top 50 most profitable stocks** (by net income) on the Colombo Stock Exchange (CSE). The stock list is dynamically updated based on net income, ensuring you always see financially strong companies with proven profitability.

**Stock Selection Criteria:**
- ✅ Highest net income (most profitable companies)
- ✅ Real-time data from TradingView
- ✅ Automatically refreshed weekly for Very Long-Term picks (Monday 12:30 PM LKT)
- ✅ Daily price and momentum updates (Mon-Fri)
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
│   ├── scraper.ts                # Serverless Convex Action for data fetching
│   ├── crons.ts                  # Scheduled job configuration
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

The **Top picks** for each timeframe receive enhanced AI-generated analysis powered by Groq's high-speed Llama 3.3 70B model.

### Key AI Features
- **Context-Aware Summaries**: Deep understanding of current market data and score justifications
- **Three-Tier Analysis**: Dedicated analysis for **Very Long-Term (5Y+), Long-Term (1Y), and Short-Term (Weekly)** on every detail page
- **Automated Score Integration**: AI mentions specific scores (e.g., "With a Very Long-Term score of 98/100...") to provide transparency
- **Detailed Risk Assessment**: Reasoning-backed risk levels (Low, Medium, High)
- **Strengths & Concerns**: Automatically identifies key investment factors based on quantitative data

### How It Works
1. **Weekly Scraper (Monday)**: Identifies Top 5 "Very Long-Term Picks" for deep-dive AI analysis.
2. **Daily Scraper (Weekdays)**: Refreshes prices and identifies Top 5 "Long-Term Stability Picks" for momentum analysis.
3. **History Preservation**: The system preserves existing AI analysis for non-targeted tiers, ensuring the Monday deep-dive stays visible all week while prices update daily.
4. **Performance**: Analysis results are stored in Convex for instant retrieval.
5. **Fallbacks**: Other stocks use intelligent template-based explanations.

## 🔄 Automated Updates

The app uses **Convex Cron Jobs** for fully automated data refreshes:
- **Daily (Mon-Fri)**: At 10:00 AM and 3:00 PM LKT. Updates all prices and generates new AI analysis for the **Top 5 Long-Term Picks**.
- **Weekly (Monday)**: At 12:30 PM LKT. Performs a deep-dive analysis for the **Top 5 Very Long-Term Picks**.
- **Process**: 
  1. **Discovery**: Identifies top 50 most profitable stocks from TradingView
  2. **Analysis**: Generates scores and handles AI insights for the targeted tier (preserving other analyses)
  3. **Atomic Update**: Updates the entire database in a single transaction
- **Benefits**: Zero external dependencies and preserved AI history across runs.
- **Manual trigger**: `npx convex run scraper:runScrape '{ "tier": "very-long-term" }'`

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

