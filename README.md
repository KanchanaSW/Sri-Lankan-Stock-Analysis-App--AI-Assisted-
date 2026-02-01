# 🇱🇰 Sri Lankan Stock Analysis App (AI-Assisted)

A web-based platform that analyzes Colombo Stock Exchange (CSE) data and presents AI-assisted insights for long-term investing and short-term trading opportunities.

## Features

- **Market Overview**: Real-time summary of market statistics
- **Long-Term Analysis**: Identify stable stocks suitable for long-term holding
- **Short-Term Opportunities**: Find high-momentum stocks for active trading
- **AI-Assisted Insights**: Plain-English explanations of stock classifications
- **Interactive Charts**: Historical price and volume visualization
- **Advanced Filtering**: Filter stocks by sector, investment type, and score

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Layer**: Mock data (Convex integration ready)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, pnpm, yarn, or bun

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles and Tailwind
│   ├── layout.tsx           # Root layout with header
│   ├── page.tsx             # Home page
│   └── stocks/
│       ├── page.tsx         # Stock list with filters
│       └── [id]/page.tsx    # Stock detail page
├── components/
│   ├── Header.tsx           # Navigation header
│   ├── DisclaimerBanner.tsx # Legal disclaimer
│   └── StockCard.tsx        # Stock display card
└── lib/
    └── mockData.ts          # Mock stock data
```

## Pages

### Home Page
- Market overview statistics
- Top 5 long-term stock picks
- Top 5 short-term opportunities
- Mandatory disclaimer banner

### Stock List Page
- Filterable list of all stocks
- Filter by sector and investment type
- Sort by long-term or short-term scores

### Stock Detail Page
- Comprehensive stock information
- Long-term and short-term scores
- AI-generated analysis
- Risk level indicator
- Historical price and volume charts

## Compliance

⚠️ **Disclaimer**: This platform provides stock market analysis for educational purposes only and does not constitute financial or investment advice. Always consult with a qualified financial advisor before making investment decisions.

## License

This project is for educational and portfolio purposes.
