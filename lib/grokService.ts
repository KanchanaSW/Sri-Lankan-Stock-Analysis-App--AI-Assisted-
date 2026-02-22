import { AIExplanation, StockScores, StockData } from './types';

// Groq API configuration (fast LLM inference with generous free tier)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Fast, high-quality, free tier friendly

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Generate AI explanation using Groq API
 * Only called for Long-Term Pick stocks (longTermScore >= 70)
 */
export async function generateGrokExplanation(
  stock: StockData,
  scores: StockScores,
  apiKey?: string
): Promise<AIExplanation | null> {
  // Check if API key is available
  const key = apiKey || process.env.GROQ_API_KEY;

  if (!key) {
    console.warn(`⚠️  No GROQ_API_KEY found for ${stock.symbol}, skipping AI generation`);
    return null;
  }

  // Build the prompt with stock context
  const prompt = buildAnalysisPrompt(stock, scores);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert financial analyst specializing in Sri Lankan stock market analysis. Provide clear, data-driven insights for long-term investors. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error for ${stock.symbol}:`, response.status, errorText);
      return null;
    }

    const data: GroqResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error(`No content in Groq response for ${stock.symbol}`);
      return null;
    }

    // Parse the JSON response
    const parsed = parseGroqResponse(content);

    if (!parsed) {
      console.error(`Failed to parse Groq response for ${stock.symbol}`);
      return null;
    }

    // Add generation timestamp
    return {
      ...parsed,
      generatedAt: Date.now(),
    };

  } catch (error) {
    console.error(`Error calling Groq API for ${stock.symbol}:`, error);
    return null;
  }
}

/**
 * Build a detailed prompt for Grok API
 */
function buildAnalysisPrompt(stock: StockData, scores: StockScores): string {
  const { veryLongTermScore, longTermScore, shortTermScore, veryLongTermFactors, longTermFactors, shortTermFactors } = scores;

  return `Analyze this Sri Lankan stock for long-term investment:

**Stock Details:**
- Symbol: ${stock.symbol}
- Name: ${stock.name}
- Sector: ${stock.sector}
- Current Price: Rs. ${stock.currentPrice.toFixed(2)}
- Price Change: ${stock.priceChange >= 0 ? '+' : ''}${stock.priceChange.toFixed(2)}%
- Market Cap: Rs. ${stock.marketCap.toFixed(2)}M
- 52-Week Range: Rs. ${stock.weekLow52.toFixed(2)} - Rs. ${stock.weekHigh52.toFixed(2)}

**Performance Scores:**
- Very Long-Term (Buy & Hold) Score: ${veryLongTermScore}/100
- Long-Term Stability Score: ${longTermScore}/100
- Short-Term Momentum Score: ${shortTermScore}/100

**Very Long-Term Factors:**
- 5-Year Performance: ${stock.perf5Y !== undefined ? `${stock.perf5Y.toFixed(2)}%` : 'N/A'} (Score: ${veryLongTermFactors.fiveYearPerformance}/100)
- 1-Year Performance: ${stock.perfY !== undefined ? `${stock.perfY.toFixed(2)}%` : 'N/A'} (Score: ${veryLongTermFactors.oneYearPerformance}/100)
- Price to 52-Week High: ${veryLongTermFactors.priceToHigh52}/100
- Market Cap Stability / Size: ${veryLongTermFactors.marketCapSize}/100
- Downside Volatility Risk (Inverted): ${veryLongTermFactors.downsideVolatility}/100

**Long-Term Factors:**
- Price Volatility: ${longTermFactors.priceVolatility}/100 (higher = more stable)
- Trend Consistency: ${longTermFactors.trendConsistency}/100
- Volume Stability: ${longTermFactors.volumeStability}/100
- Sector Strength: ${longTermFactors.sectorStrength}/100
- Market Cap Stability: ${longTermFactors.marketCapStability}/100

**Short-Term Factors:**
- Volume Change: ${shortTermFactors.volumeChange}/100
- Price Momentum: ${shortTermFactors.priceMomentum}/100
- Breakout Detection: ${shortTermFactors.breakoutDetection}/100
- Trend Acceleration: ${shortTermFactors.trendAcceleration}/100

**Task:** Provide a comprehensive analysis suitable for long-term investors. Focus on 5-year stability, reliability, and sustained returns.

**Response Format (JSON only):**
{
  "summary": "2-3 sentence overview of the stock's investment profile",
  "veryLongTermAnalysis": "Detailed paragraph analyzing 5-year+ buy-and-hold viability, factoring in historical performance and market cap base. Mention the Very Long-Term score of ${veryLongTermScore}/100.",
  "longTermAnalysis": "Detailed paragraph analyzing 1-year stability and recent market consistency. Mention the Long-Term Stability score of ${longTermScore}/100.",
  "shortTermAnalysis": "Paragraph on short-term momentum and current market sentiment. Mention the Short-Term Momentum score of ${shortTermScore}/100.",
  "riskLevel": "Low" | "Medium" | "High",
  "riskReasoning": "Explanation of the risk assessment",
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "keyConcerns": ["concern 1", "concern 2"]
}`;
}

/**
 * Parse Groq's JSON response
 */
function parseGroqResponse(content: string): Omit<AIExplanation, 'generatedAt'> | null {
  try {
    // Try to extract JSON from markdown code blocks if present
    let jsonString = content.trim();

    // Remove markdown code fences if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const parsed = JSON.parse(jsonString);

    // Validate required fields
    if (!parsed.summary || !parsed.longTermAnalysis || !parsed.shortTermAnalysis) {
      return null;
    }

    if (!['Low', 'Medium', 'High'].includes(parsed.riskLevel)) {
      return null;
    }

    if (!Array.isArray(parsed.keyStrengths) || !Array.isArray(parsed.keyConcerns)) {
      return null;
    }

    return {
      summary: parsed.summary,
      veryLongTermAnalysis: parsed.veryLongTermAnalysis,
      longTermAnalysis: parsed.longTermAnalysis,
      shortTermAnalysis: parsed.shortTermAnalysis,
      riskLevel: parsed.riskLevel,
      riskReasoning: parsed.riskReasoning || '',
      keyStrengths: parsed.keyStrengths,
      keyConcerns: parsed.keyConcerns,
    };
  } catch (error) {
    console.error('Failed to parse Groq response:', error);
    return null;
  }
}

/**
 * Batch generate explanations for multiple stocks
 * Processes sequentially to respect rate limits
 */
export async function batchGenerateExplanations(
  stocksWithScores: Array<{ stock: StockData; scores: StockScores }>,
  apiKey?: string
): Promise<Map<string, AIExplanation>> {
  const results = new Map<string, AIExplanation>();

  console.log(`\n🤖 Generating AI explanations for ${stocksWithScores.length} Long-Term Picks...\n`);

  for (const { stock, scores } of stocksWithScores) {
    console.log(`   Analyzing ${stock.symbol}...`);

    const explanation = await generateGrokExplanation(stock, scores, apiKey);

    if (explanation) {
      results.set(stock.symbol, explanation);
      console.log(`   ✅ ${stock.symbol} - AI analysis generated`);
    } else {
      console.log(`   ⚠️  ${stock.symbol} - AI generation failed, will use template`);
    }

    // Add a small delay to respect rate limits (500ms between requests)
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Generated ${results.size}/${stocksWithScores.length} AI explanations\n`);

  return results;
}
