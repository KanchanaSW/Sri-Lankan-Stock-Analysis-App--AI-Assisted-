# 🇱🇰 Sri Lankan Stock Analysis App (AI-Assisted)

## 1. Overview

The Sri Lankan Stock Analysis App is a web-based platform that analyzes Colombo Stock Exchange (CSE) data and presents AI-assisted insights for long-term investing (stable returns) and short-term trading (high momentum opportunities).

The application focuses on analysis and insights, not financial advice, and is designed as a frontend-first, portfolio-grade product.

**🌐 Live Demo:** [slstocks.netlify.app](https://slstocks.netlify.app)

---

## 2. Goals & Objectives

### Primary Goals
- Provide clear, explainable stock analysis for Sri Lankan equities
- Help users distinguish between long-term stable stocks and short-term high-momentum stocks
- Present complex financial data in a simple, visual, and understandable UI

### Non-Goals
- Real-time trading or order execution
- Guaranteed profit predictions
- Personalized financial advice

---

## 3. Target Users
- Retail investors in Sri Lanka
- Beginner to intermediate stock market learners
- Developers / recruiters reviewing the app as a portfolio project

---

## 4. Legal & Compliance

### ⚠️ Mandatory Disclaimer

> This platform provides stock market analysis for educational purposes only and does not constitute financial or investment advice.

The disclaimer is visible:
- ✅ On the homepage
- ✅ On the stock list page
- ✅ On each stock detail page

---

## 5. Core Features (MVP)

### 5.1 Market Data Ingestion
- Daily stock price data (Open, High, Low, Close)
- Trading volume
- Market capitalization
- Sector classification
- 52-week high / low

**Data Source:**
- TradingView Scanner API (`scanner.tradingview.com/srilanka/scan`)
- Automatically discovers top 50 most profitable stocks (by net income)
- Scraped daily at 3:00 PM LKT via GitHub Actions

---

### 5.2 Stock Classification

Each stock is classified into one or more of the following categories:

#### 🟢 Long-Term (Stable Return Candidate)
**Characteristics:**
- Lower volatility
- Consistent price trend
- Stable volume
- Strong sector performance

**Displayed as:**
- "Long-Term Stability Score" (0–100)

---

#### 🔴 Short-Term (High Return Opportunity)
**Characteristics:**
- Volume spikes
- Price breakouts
- High momentum indicators

**Displayed as:**
- "Short-Term Momentum Score" (0–100)

---

### 5.3 AI-Assisted Insights

AI is used to explain analysis, not to calculate raw indicators.

For each stock:
- Plain-English explanation of why it is classified as long-term or short-term
- Risk level explanation (Low / Medium / High)
- Key strengths and concerns

**Example:**
> "This stock shows stable price movement with low volatility over the past year, making it suitable for long-term holding."

---

## 6. Scoring System (Explainable)

### 6.1 Long-Term Stability Score (0–100)

**Weighted factors:**
| Factor | Weight |
|--------|--------|
| Price Volatility | 25% |
| Trend Consistency | 25% |
| Volume Stability | 20% |
| Sector Strength | 20% |
| Market Cap Stability | 10% |

---

### 6.2 Short-Term Momentum Score (0–100)

**Weighted factors:**
| Factor | Weight |
|--------|--------|
| Volume Change | 30% |
| Price Momentum | 30% |
| Breakout Detection | 20% |
| Recent Trend Acceleration | 20% |

---

## 7. User Experience & Pages

### 7.1 Home Page
- ✅ Market overview summary (total stocks, gainers, losers, volume)
- ✅ Top 5 Long-Term picks
- ✅ Top 5 Short-Term picks
- ✅ Disclaimer banner
- ✅ Last updated timestamp

---

### 7.2 Stock List Page
- ✅ Filter by:
  - Sector
  - Investment type (Long-term / Short-term)
  - Market cap range (Small / Mid / Large / Mega)
- ✅ Sort by score (Long-term, Short-term, Price, Price Change)
- ✅ Result count display

---

### 7.3 Stock Detail Page
- ✅ Price chart (historical)
- ✅ Volume chart
- ✅ Long-term & Short-term scores with factor breakdown
- ✅ AI-generated explanation
- ✅ Risk indicator
- ✅ Key strengths and concerns
- ✅ Disclaimer banner

---

## 8. Data Update Strategy

- ✅ Data scraped daily at 3:00 PM LKT (Sri Lanka Time)
- ✅ Automated via GitHub Actions (weekdays)
- ✅ TradingView API provides real-time market data
- ✅ Atomic database replacement (entire stock list replaced each run)
- ✅ Scores calculated client-side from database data
- ✅ Manual trigger available: `npm run scrape`

No real-time websocket updates required.

---

## 9. Technical Architecture (MVP)

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 (App Router) | React framework |
| React 18 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Recharts | Interactive charts |

### Backend / Database
| Technology | Purpose |
|------------|---------|
| Convex | Real-time database + API |
| Convex Mutations | Data write operations |
| Convex Queries | Data read operations |
| Convex Subscriptions | Real-time updates |

### Data Ingestion
| Technology | Purpose |
|------------|---------|
| TradingView Scanner API | Stock data source |
| GitHub Actions | Scheduled daily scraper (3:00 PM LKT) |
| `scripts/scrapeTradingView.ts` | Scraper script |

### Hosting
| Platform | Purpose |
|----------|---------|
| Netlify | Frontend hosting |
| Convex Cloud | Database hosting |

### AI Layer
- Rule-based scoring algorithms
- Template-based text generation for explanations
- No external LLM required for MVP

---

## 10. Performance & Constraints

- ✅ App loads within 3 seconds on average connections
- ✅ Charts handle historical data smoothly (Recharts)
- ✅ Client-side score calculation: ~50-100ms per stock
- ✅ Convex queries: <100ms typically
- ✅ Real-time subscriptions: Near-instant updates
- ✅ Atomic stock replacement: ~5-10 seconds for 50 stocks

---

## 11. Success Metrics

- ✅ Clear differentiation between long-term and short-term stocks
- ✅ Easy-to-understand explanations for non-experts
- ✅ Clean, professional UI suitable for portfolio presentation
- ✅ Zero linter errors
- ✅ Full TypeScript type safety
- ✅ Modular, maintainable code

---

## 12. Tracked Stocks

The app automatically tracks the **top 50 most profitable stocks** (by net income) on the Colombo Stock Exchange.

**Stock Selection Criteria:**
- ✅ Highest net income (most profitable companies)
- ✅ Real-time data from TradingView
- ✅ Automatically refreshed daily
- ✅ Includes: sector, market cap, 52-week high/low

**Classification by AI Scoring:**
- **Long-Term Picks**: Stocks with stability score ≥ 70
- **Short-Term Picks**: Stocks with momentum score ≥ 70

---

## 13. Future Enhancements (Post-MVP)
- Sector-level analysis
- Historical performance comparison
- Watchlists
- News sentiment analysis
- Export reports
- OHLC historical data integration

---

## 14. Summary

This project demonstrates:
- ✅ Frontend engineering skills (Next.js, React, TypeScript)
- ✅ Data analysis thinking (scoring algorithms)
- ✅ Responsible AI usage (explainable insights)
- ✅ Real-world product design for the Sri Lankan market
- ✅ Full-stack integration (Convex, GitHub Actions)
- ✅ Production deployment (Netlify, automated updates)

It is designed to be **educational, explainable, and portfolio-ready**.

---

## 15. Quick Start

```bash
# Clone and install
git clone https://github.com/KanchanaSW/Sri-Lankan-Stock-Analysis-App--AI-Assisted-.git
cd "Sri Lankan Stock Analysis App (AI-Assisted)"
npm install

# Set up Convex
npx convex dev

# Run development
npm run dev

# Seed database
npm run seed

# Fetch latest stock prices
npm run scrape
```

**Environment Variables:**
```env
NEXT_PUBLIC_CONVEX_URL=your-convex-deployment-url
CONVEX_URL=your-convex-deployment-url
```
