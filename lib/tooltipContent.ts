// Tooltip content for all scoring metrics across investment tiers

export interface TooltipContent {
    title: string
    description: string
    calculation?: string
}

// ─────────────────────────────────────────────
// VERY LONG-TERM (Buy & Hold) factor tooltips
// ─────────────────────────────────────────────
export const veryLongTermFactorTooltips: Record<string, TooltipContent> = {
    fiveYearPerformance: {
        title: '5-Year Performance',
        description:
            'Measures how much the stock has grown over the past 5 years. A strong 5-year return suggests the company compounds value reliably over time, which is the most important signal for a buy-and-hold investor.',
        calculation:
            'Scored from 0–100 by mapping –50% return → 0, 0% → 50, and 100% return → 100. Carries the heaviest weight (40%) in the Very Long-Term score.',
    },
    oneYearPerformance: {
        title: '1-Year Performance',
        description:
            "Captures the stock's growth over the past 12 months. It acts as a 'recent health check' — a positive 1-year run on top of a solid 5-year track record adds confidence.",
        calculation:
            'Scored from 0–100 by mapping –25% → 0, 0% → 50, and +50% → 100. Weighted 15% in the Very Long-Term score.',
    },
    priceToHigh52: {
        title: 'Price to 52-Week High',
        description:
            'Shows how close the current price is to its highest point over the past year. A stock trading near its 52-week high often signals strong momentum and investor confidence.',
        calculation:
            'Ratio of current price ÷ 52-week high, normalised from 0.5× (halfback) to 1.0× (at high). Weighted 15% in the Very Long-Term score.',
    },
    marketCapSize: {
        title: 'Market Cap Stability',
        description:
            'Larger companies listed on the CSE tend to have greater liquidity, more analyst coverage, and better resilience during market downturns — ideal for long holding periods.',
        calculation:
            'Uses a log₁₀ scale of market cap (LKR millions), normalised between Rs 3.2 bn and Rs 316 bn. Weighted 15% in the Very Long-Term score.',
    },
    downsideVolatility: {
        title: 'Downside Risk',
        description:
            'Measures only the negative daily price swings (drawdown risk). Unlike total volatility, downside risk focuses on losses — a key concern for investors holding through bear markets.',
        calculation:
            'Calculates the average of only negative daily returns. A smaller average loss scores higher. Normalised between –0.5% and –3% average daily loss. Weighted 15%.',
    },
}

// ─────────────────────────────────────────────
// LONG-TERM STABILITY factor tooltips
// ─────────────────────────────────────────────
export const longTermFactorTooltips: Record<string, TooltipContent> = {
    priceVolatility: {
        title: 'Price Volatility',
        description:
            'Measures how wildly the stock price swings day-to-day. Lower volatility means smoother, more predictable price movements — a sign of a stable, mature business suited to long-term holding.',
        calculation:
            'Standard deviation of daily returns, normalised and inverted so 1% daily volatility → 100 and 5% daily volatility → 0. Weighted 25%.',
    },
    trendConsistency: {
        title: 'Trend Consistency',
        description:
            'Indicates how well the stock follows a clear, steady upward (or downward) trend rather than moving erratically. High consistency suggests predictable, reliable growth over time.',
        calculation:
            'Uses the R² (coefficient of determination) from a linear regression of price over time. R² near 1 means a very consistent trend. Weighted 25%.',
    },
    volumeStability: {
        title: 'Volume Stability',
        description:
            'Reflects how steady the daily trading volume is. Stable volume shows reliable investor interest and good market liquidity, reducing the risk of being unable to exit a position.',
        calculation:
            'Coefficient of variation (std dev ÷ mean) of daily volumes, inverted so stable volume → high score. Normalised between CV 0.3 and 1.5. Weighted 20%.',
    },
    sectorStrength: {
        title: 'Sector Strength',
        description:
            'Reflects the overall health and recent performance of the sector this stock operates in. A rising tide lifts all boats — a strong sector provides tailwinds for individual stocks.',
        calculation:
            'Based on sector-level average performance data for CSE sectors (Banking, Finance, Energy, etc.), normalised from –5% to +10% sector growth. Weighted 20%.',
    },
    marketCapStability: {
        title: 'Market Cap Stability',
        description:
            'Tracks how steadily the company\'s market capitalisation has moved. A stable market cap indicates consistent investor confidence without boom-and-bust cycles.',
        calculation:
            'Average absolute daily price change, inverted so small daily moves → high score. Normalised between 1% and 4% average daily change. Weighted 10%.',
    },
}

// ─────────────────────────────────────────────
// SHORT-TERM MOMENTUM factor tooltips
// ─────────────────────────────────────────────
export const shortTermFactorTooltips: Record<string, TooltipContent> = {
    volumeChange: {
        title: 'Volume Change',
        description:
            'Compares recent trading activity to its recent average. A surge in volume often precedes a significant price move — it shows growing market interest and conviction behind a trend.',
        calculation:
            'Compares the 5-day average volume to the prior 15-day average. A +200% surge → 100, a –50% drop → 0. Weighted 30%.',
    },
    priceMomentum: {
        title: 'Price Momentum',
        description:
            'Captures the rate and direction of price change over the past 14 days. Strong positive momentum suggests the market is actively bidding the stock up in the short term.',
        calculation:
            'Rate of change: (current price – price 14 days ago) ÷ price 14 days ago. Normalised from –15% to +15% change. Weighted 30%.',
    },
    breakoutDetection: {
        title: 'Breakout Detection',
        description:
            'Shows where the stock sits within its 52-week price range. A stock near its yearly high may be breaking out to new levels, which is a bullish signal for short-term traders.',
        calculation:
            'Position = (current price – 52-week low) ÷ (52-week high – 52-week low). Closer to the high → higher score. Weighted 20%.',
    },
    trendAcceleration: {
        title: 'Trend Acceleration',
        description:
            'Measures whether the recent price trend is speeding up or slowing down. Accelerating upward price movement often signals the start of a stronger rally.',
        calculation:
            'Compares the price change in the last 14 days vs. the previous 14 days. If recent gains outpace older gains, the trend is accelerating. Normalised ±20%. Weighted 20%.',
    },
}

// ─────────────────────────────────────────────
// OVERALL SCORE (ScoreBadge) tooltips
// ─────────────────────────────────────────────
export const overallScoreTooltips: Record<string, TooltipContent> = {
    'very-long-term': {
        title: 'Very Long-Term Score (Buy & Hold)',
        description:
            'Composite score (0–100) for suitability as a multi-year buy-and-hold investment. It rewards stocks with strong historical performance, large market cap, and low downside risk.',
        calculation:
            '40% 5-Year Performance + 15% 1-Year Performance + 15% Price-to-52wk-High + 15% Market Cap Size + 15% Downside Volatility.',
    },
    'long-term': {
        title: 'Long-Term Stability Score',
        description:
            'Composite score (0–100) measuring how stable and reliable the stock is for holding over 1–3 years. Higher scores indicate lower volatility, consistent trends, and sector tailwinds.',
        calculation:
            '25% Price Volatility + 25% Trend Consistency + 20% Volume Stability + 20% Sector Strength + 10% Market Cap Stability.',
    },
    'short-term': {
        title: 'Short-Term Momentum Score',
        description:
            'Composite score (0–100) measuring near-term trading potential. A high score indicates strong recent price momentum, rising volume, and possible price breakouts.',
        calculation:
            '30% Volume Change + 30% Price Momentum + 20% Breakout Detection + 20% Trend Acceleration.',
    },
}

// Helper to look up factor tooltip by tier and key
export function getFactorTooltip(
    type: 'very-long-term' | 'long-term' | 'short-term',
    factorKey: string
): TooltipContent | undefined {
    if (type === 'very-long-term') return veryLongTermFactorTooltips[factorKey]
    if (type === 'long-term') return longTermFactorTooltips[factorKey]
    return shortTermFactorTooltips[factorKey]
}
