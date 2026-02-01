🇱🇰 Sri Lankan Stock Analysis App (AI-Assisted)

1. Overview

The Sri Lankan Stock Analysis App is a web-based platform that analyzes Colombo Stock Exchange (CSE) data and presents AI-assisted insights for long-term investing (stable returns) and short-term trading (high momentum opportunities).

The application focuses on analysis and insights, not financial advice, and is designed as a frontend-first, portfolio-grade product.

⸻

2. Goals & Objectives

Primary Goals
	•	Provide clear, explainable stock analysis for Sri Lankan equities
	•	Help users distinguish between long-term stable stocks and short-term high-momentum stocks
	•	Present complex financial data in a simple, visual, and understandable UI

Non-Goals
	•	Real-time trading or order execution
	•	Guaranteed profit predictions
	•	Personalized financial advice

⸻

3. Target Users
	•	Retail investors in Sri Lanka
	•	Beginner to intermediate stock market learners
	•	Developers / recruiters reviewing the app as a portfolio project

⸻

4. Legal & Compliance

⚠️ Mandatory Disclaimer

This platform provides stock market analysis for educational purposes only and does not constitute financial or investment advice.

The disclaimer must be visible:
	•	On the homepage
	•	On each stock detail page

⸻

5. Core Features (MVP)

5.1 Market Data Ingestion
	•	Daily stock price data (Open, High, Low, Close)
	•	Trading volume
	•	Market capitalization (if available)
	•	Sector classification
	•	52-week high / low (derived)

Data Source
	•	Publicly available CSE data (scraped once per day)

⸻

5.2 Stock Classification

Each stock is classified into one or more of the following categories:

🟢 Long-Term (Stable Return Candidate)
Characteristics:
	•	Lower volatility
	•	Consistent price trend
	•	Stable volume
	•	Strong sector performance

Displayed as:
	•	“Long-Term Stability Score” (0–100)

⸻

🔴 Short-Term (High Return Opportunity)
Characteristics:
	•	Volume spikes
	•	Price breakouts
	•	High momentum indicators

Displayed as:
	•	“Short-Term Momentum Score” (0–100)

⸻

5.3 AI-Assisted Insights

AI is used to explain analysis, not to calculate raw indicators.

For each stock:
	•	Plain-English explanation of why it is classified as long-term or short-term
	•	Risk level explanation (Low / Medium / High)

Example:

“This stock shows stable price movement with low volatility over the past year, making it suitable for long-term holding.”

⸻

6. Scoring System (Explainable)

6.1 Long-Term Stability Score (0–100)

Weighted factors:
	•	Price volatility (25%)
	•	Trend consistency (25%)
	•	Volume stability (20%)
	•	Sector strength (20%)
	•	Market cap stability (10%)

⸻

6.2 Short-Term Momentum Score (0–100)

Weighted factors:
	•	Volume change (30%)
	•	Price momentum (30%)
	•	Breakout detection (20%)
	•	Recent trend acceleration (20%)

⸻

7. User Experience & Pages

7.1 Home Page
	•	Market overview summary
	•	Top 5 Long-Term picks
	•	Top 5 Short-Term picks
	•	Disclaimer banner

⸻

7.2 Stock List Page
	•	Filter by:
	•	Sector
	•	Market cap
	•	Long-term / Short-term
	•	Sort by score

⸻

7.3 Stock Detail Page
	•	Price chart (historical)
	•	Volume chart
	•	Long-term & Short-term scores
	•	AI-generated explanation
	•	Risk indicator

⸻

8. Data Update Strategy
	•	Data is scraped once per day
	•	Analysis recalculated after data ingestion
	•	AI insights generated and cached

No real-time updates required.

⸻

9. Technical Architecture (MVP)

Frontend
	•	Next.js 14 (App Router)
	•	Tailwind CSS
	•	Chart library (Recharts / Chart.js)

Backend / DB
	•	Convex (database + API)

Data Ingestion
	•	External cron (GitHub Actions or Vercel Cron)
	•	Push processed data into Convex

AI Layer
	•	Rule-based logic + optional LLM
	•	AI generates text explanations only

⸻

10. Performance & Constraints
	•	App must load within 3 seconds on average connections
	•	Charts must handle 1–3 years of daily data smoothly
	•	All heavy computation done server-side

⸻

11. Success Metrics
	•	Clear differentiation between long-term and short-term stocks
	•	Easy-to-understand explanations for non-experts
	•	Clean, professional UI suitable for portfolio presentation

⸻

12. Future Enhancements (Post-MVP)
	•	Sector-level analysis
	•	Historical performance comparison
	•	Watchlists
	•	News sentiment analysis
	•	Export reports

⸻

13. Summary

This project demonstrates:
	•	Frontend engineering skills
	•	Data analysis thinking
	•	Responsible AI usage
	•	Real-world product design for the Sri Lankan market

It is designed to be educational, explainable, and portfolio-ready.
