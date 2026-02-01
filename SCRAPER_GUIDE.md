# Stock Scraper - Setup Guide

## Overview

This guide covers setting up an automated stock price scraper that updates your Convex database with **real-time CSE stock data** from [TradingView](https://www.tradingview.com/symbols/CSELK-JKH.N0000/).

## ✅ Data Source: TradingView

The scraper uses **TradingView's Scanner API** to fetch real Colombo Stock Exchange (CSE) data:
- Exchange: `CSELK` (Colombo Stock Exchange)
- Symbol format: `JKH.N0000` (e.g., [JKH on TradingView](https://www.tradingview.com/symbols/CSELK-JKH.N0000/))

### Currently Supported Stocks:
| Symbol | Company | TradingView Symbol |
|--------|---------|-------------------|
| JKH | John Keells Holdings | JKH.N0000 |
| COMB | Commercial Bank | COMB.N0000 |
| NDB | National Development Bank | NDB.N0000 |
| DIAL | Dialog Axiata | DIAL.N0000 |
| LOLC | LOLC Holdings | LOLC.N0000 |
| SAMP | Sampath Bank | SAMP.N0000 |
| CTC | Ceylon Tobacco | CTC.N0000 |
| LIOC | Lanka IOC | LIOC.N0000 |
| HNB | Hatton National Bank | HNB.N0000 |
| TOK | Tokyo Cement | TKYO.N0000 |

## Why External Script?

Convex actions have limitations with the `fetch()` API and circular dependencies when trying to reference other Convex functions. The best approach is to create an external Node.js script that:
1. Fetches data from TradingView's Scanner API
2. Updates Convex database directly using the Convex client

## Setup Instructions

### 1. Install Convex Client

```bash
npm install convex
```

### 2. Create Scraper Script

Create `scripts/scrapeYahooFinance.ts`:

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Initialize Convex client
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL!;
const client = new ConvexHttpClient(CONVEX_URL);

// CSE stock symbols on Yahoo Finance (use .CMB suffix)
const STOCKS = [
  { local: "JKH", yahoo: "JKH.CMB" },
  { local: "COMB", yahoo: "COMB.CMB" },
  { local: "NDB", yahoo: "NDB.CMB" },
  { local: "DIAL", yahoo: "DIAL.CMB" },
  { local: "LOLC", yahoo: "LOLC.CMB" },
  { local: "SAMP", yahoo: "SAMP.CMB" },
  { local: "CTC", yahoo: "CTC.CMB" },
  { local: "LIOC", yahoo: "LIOC.CMB" },
  { local: "HNB", yahoo: "HNB.CMB" },
  { local: "HEMAS", yahoo: "HEMAS.CMB" },
  { local: "NEST", yahoo: "NEST.CMB" },
  { local: "TOK", yahoo: "TOK.CMB" },
];

interface YahooFinanceQuote {
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

interface YahooFinanceChart {
  chart: {
    result?: Array<{
      meta: YahooFinanceQuote;
    }>;
    error?: { code: string; description: string };
  };
}

async function fetchStockPrice(yahooSymbol: string): Promise<YahooFinanceQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StockAnalyzer/1.0)" },
    });

    if (!response.ok) return null;

    const data: YahooFinanceChart = await response.json();
    if (data.chart.error || !data.chart.result?.[0]) return null;

    return data.chart.result[0].meta;
  } catch (error) {
    console.error(`Error fetching ${yahooSymbol}:`, error);
    return null;
  }
}

async function updateAllPrices() {
  console.log("Starting stock price update...");
  let successCount = 0;

  for (const { local, yahoo } of STOCKS) {
    try {
      // Fetch current price
      const quote = await fetchStockPrice(yahoo);
      if (!quote || !quote.regularMarketPrice) {
        console.warn(`No data for ${local}`);
        continue;
      }

      // Get stock from Convex
      const stock = await client.query(api.stocks.getStockBySymbol, {
        symbol: local,
      });

      if (!stock) {
        console.warn(`Stock ${local} not found in database`);
        continue;
      }

      // Calculate price change
      const previousClose = quote.chartPreviousClose || stock.currentPrice;
      const priceChange =
        ((quote.regularMarketPrice - previousClose) / previousClose) * 100;

      // Update in Convex
      await client.mutation(api.mutations.updateStock, {
        stockId: stock._id,
        currentPrice: quote.regularMarketPrice,
        priceChange: priceChange,
        weekHigh52: quote.fiftyTwoWeekHigh,
        weekLow52: quote.fiftyTwoWeekLow,
      });

      console.log(
        `✓ Updated ${local}: $${quote.regularMarketPrice} (${
          priceChange > 0 ? "+" : ""
        }${priceChange.toFixed(2)}%)`
      );
      successCount++;

      // Rate limiting: 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error updating ${local}:`, error);
    }
  }

  console.log(`\nComplete: ${successCount}/${STOCKS.length} stocks updated`);
  process.exit(0);
}

updateAllPrices();
```

### 3. Add Script Command

Add to `package.json`:

```json
{
  "scripts": {
    "scrape": "tsx scripts/scrapeYahooFinance.ts"
  }
}
```

### 4. Install tsx (TypeScript execution)

```bash
npm install -D tsx
```

### 5. Run the Scraper

```bash
# Make sure Convex is set up first
npx convex dev

# In another terminal, run the scraper
npm run scrape
```

## Automated Updates

### Option 1: Cron Job (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add line to run daily at 3PM Sri Lanka time (9:30 AM UTC)
30 9 * * * cd /path/to/project && npm run scrape >> /var/log/stock-scraper.log 2>&1
```

### Option 2: GitHub Actions

Create `.github/workflows/scrape-stocks.yml`:

```yaml
name: Scrape Stock Data

on:
  schedule:
    - cron: '30 9 * * *'  # 3PM Sri Lanka time daily
  workflow_dispatch:  # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run scrape
        env:
          CONVEX_URL: ${{ secrets.CONVEX_URL }}
```

Add `CONVEX_URL` to your GitHub repository secrets.

### Option 3: Vercel Cron (if deployed on Vercel)

Create `app/api/scrape/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Run your scraper logic here
  // ...

  return NextResponse.json({ success: true });
}
```

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/scrape",
    "schedule": "30 9 * * *"
  }]
}
```

## Testing

Test the scraper manually:

```bash
# Make sure you have seeded data first
npm run seed

# Run the scraper
npm run scrape

# Check the Convex dashboard to see updated prices
```

## Notes

- Yahoo Finance API is unofficial but reliable
- Rate limiting (1 req/sec) prevents blocking
- CSE stocks use `.CMB` suffix on Yahoo Finance
- Market hours: Mon-Fri, 9:30 AM - 2:30 PM Sri Lanka time
- Run scraper after market close (after 2:30 PM)

## Troubleshooting

**"Stock not found in database"**
- Run `npm run seed` first to populate initial data

**Rate limiting errors**
- Increase delay between requests in the script
- Wait a few minutes before retrying

**No data for certain stocks**
- Verify the Yahoo Finance symbol is correct
- Check if the stock is actively traded
- Some CSE stocks may not have coverage on Yahoo Finance
