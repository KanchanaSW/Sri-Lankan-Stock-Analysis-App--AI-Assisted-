import { AIExplanation, StockScores, ScoreFactors, MomentumFactors } from './types'

// ==================== HELPER FUNCTIONS ====================

function identifyStrongestFactors(factors: ScoreFactors | MomentumFactors, count: number = 2): string[] {
  const entries = Object.entries(factors).sort((a, b) => b[1] - a[1])
  return entries.slice(0, count).map(([key]) => formatFactorName(key))
}

function identifyWeakestFactors(factors: ScoreFactors | MomentumFactors, count: number = 2): string[] {
  const entries = Object.entries(factors).sort((a, b) => a[1] - b[1])
  return entries.slice(0, count).map(([key]) => formatFactorName(key))
}

function formatFactorName(key: string): string {
  // Convert camelCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function getScoreLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

// ==================== RISK CALCULATION ====================

function calculateRiskLevel(scores: StockScores): 'Low' | 'Medium' | 'High' {
  const avgScore = (scores.longTermScore + scores.shortTermScore) / 2
  
  // High average score = low risk
  if (avgScore >= 70) return 'Low'
  if (avgScore >= 55) return 'Medium'
  return 'High'
}

function generateRiskReasoning(
  riskLevel: 'Low' | 'Medium' | 'High',
  scores: StockScores
): string {
  const { longTermScore, shortTermScore, longTermFactors, shortTermFactors } = scores
  
  if (riskLevel === 'Low') {
    const strengths: string[] = []
    if (longTermFactors.priceVolatility >= 70) strengths.push('low price volatility')
    if (longTermFactors.trendConsistency >= 70) strengths.push('consistent trend patterns')
    if (shortTermFactors.priceMomentum >= 70) strengths.push('strong positive momentum')
    
    return `This stock demonstrates ${strengths.length > 0 ? strengths.join(' and ') : 'strong fundamentals'}, indicating lower investment risk with reliable performance metrics.`
  }
  
  if (riskLevel === 'Medium') {
    return `This stock shows moderate risk characteristics with a balanced profile. While some indicators are positive, there are areas of volatility or uncertainty that investors should monitor.`
  }
  
  // High risk
  const concerns: string[] = []
  if (longTermFactors.priceVolatility < 50) concerns.push('high price volatility')
  if (shortTermFactors.volumeChange < 50) concerns.push('inconsistent trading volumes')
  if (shortTermFactors.trendAcceleration < 40) concerns.push('uncertain trend direction')
  
  return `This stock carries higher risk due to ${concerns.length > 0 ? concerns.join(', ') : 'challenging market conditions'}. More suitable for risk-tolerant investors with active monitoring capabilities.`
}

// ==================== EXPLANATION GENERATION ====================

function generateLongTermAnalysis(score: number, factors: ScoreFactors): string {
  const level = getScoreLevel(score)
  const strongest = identifyStrongestFactors(factors, 2)
  const weakest = identifyWeakestFactors(factors, 1)
  
  if (level === 'high') {
    return `This stock demonstrates excellent long-term stability characteristics with a score of ${score}/100. Key strengths include ${strongest[0].toLowerCase()} and ${strongest[1].toLowerCase()}, making it well-suited for buy-and-hold strategies. The consistent performance across multiple quarters suggests reliable returns over extended investment horizons.`
  }
  
  if (level === 'medium') {
    return `With a long-term stability score of ${score}/100, this stock shows moderate characteristics for extended holding. While ${strongest[0].toLowerCase()} is favorable, ${weakest[0].toLowerCase()} shows room for improvement. This may be suitable for diversified portfolios with a balanced risk approach.`
  }
  
  return `The long-term stability score of ${score}/100 indicates this stock may face challenges for extended holding periods. Concerns around ${weakest[0].toLowerCase()} suggest higher volatility. Investors should carefully evaluate their risk tolerance and investment timeline before committing to this position.`
}

function generateShortTermAnalysis(score: number, factors: MomentumFactors): string {
  const level = getScoreLevel(score)
  const strongest = identifyStrongestFactors(factors, 2)
  const weakest = identifyWeakestFactors(factors, 1)
  
  if (level === 'high') {
    return `This stock exhibits strong short-term momentum with a score of ${score}/100. Notable factors include exceptional ${strongest[0].toLowerCase()} and robust ${strongest[1].toLowerCase()}. This suggests significant near-term market interest and potential for tactical trading opportunities. However, higher momentum typically comes with increased volatility.`
  }
  
  if (level === 'medium') {
    return `With a momentum score of ${score}/100, this stock shows moderate short-term potential. ${strongest[0]} is encouraging, though ${weakest[0].toLowerCase()} remains a concern. This may appeal to investors seeking balanced exposure to near-term market movements without excessive risk.`
  }
  
  return `The short-term momentum score of ${score}/100 indicates limited near-term catalysts. Challenges with ${weakest[0].toLowerCase()} suggest reduced market interest at present. This stock may be more suitable for patient, long-term focused investors rather than active traders.`
}

function generateSummary(scores: StockScores): string {
  const { longTermScore, shortTermScore } = scores
  
  // Determine primary classification
  if (longTermScore >= 70 && shortTermScore < 65) {
    return `This stock is classified as a long-term stability candidate, making it ideal for investors seeking steady, reliable returns over extended periods. The strong stability metrics outweigh the moderate momentum indicators.`
  }
  
  if (shortTermScore >= 70 && longTermScore < 65) {
    return `This stock is classified as a short-term momentum opportunity, suitable for active traders capitalizing on near-term price movements. The elevated momentum indicators suggest current market interest, though stability for extended holding is less certain.`
  }
  
  if (longTermScore >= 70 && shortTermScore >= 70) {
    return `This stock presents a rare combination of both long-term stability and short-term momentum, making it attractive for various investment strategies. It offers the potential for near-term gains while maintaining characteristics suitable for extended holding.`
  }
  
  if (longTermScore < 50 && shortTermScore < 50) {
    return `This stock currently shows limited appeal for both long-term holding and short-term trading. Investors should carefully assess the risk-reward profile and consider whether this aligns with their portfolio objectives and risk tolerance.`
  }
  
  return `This stock demonstrates balanced characteristics across both long-term stability and short-term momentum dimensions. It may serve as a moderate addition to diversified portfolios, though neither classification strongly dominates.`
}

function generateKeyStrengths(scores: StockScores): string[] {
  const { longTermFactors, shortTermFactors } = scores
  const strengths: string[] = []
  
  // Check long-term factors
  if (longTermFactors.priceVolatility >= 75) {
    strengths.push('Exceptionally low price volatility')
  }
  if (longTermFactors.trendConsistency >= 75) {
    strengths.push('Highly consistent price trends')
  }
  if (longTermFactors.volumeStability >= 75) {
    strengths.push('Stable and predictable trading volumes')
  }
  if (longTermFactors.sectorStrength >= 75) {
    strengths.push('Strong sector performance and positioning')
  }
  
  // Check short-term factors
  if (shortTermFactors.volumeChange >= 75) {
    strengths.push('Significant recent volume increases')
  }
  if (shortTermFactors.priceMomentum >= 75) {
    strengths.push('Strong positive price momentum')
  }
  if (shortTermFactors.breakoutDetection >= 75) {
    strengths.push('Approaching or at 52-week highs')
  }
  if (shortTermFactors.trendAcceleration >= 75) {
    strengths.push('Accelerating upward trend')
  }
  
  return strengths.length > 0 ? strengths : ['Moderate performance across key metrics']
}

function generateKeyConcerns(scores: StockScores): string[] {
  const { longTermFactors, shortTermFactors } = scores
  const concerns: string[] = []
  
  // Check long-term factors
  if (longTermFactors.priceVolatility < 40) {
    concerns.push('High price volatility may impact stability')
  }
  if (longTermFactors.trendConsistency < 40) {
    concerns.push('Inconsistent price trend patterns')
  }
  if (longTermFactors.volumeStability < 40) {
    concerns.push('Irregular trading volume patterns')
  }
  if (longTermFactors.sectorStrength < 40) {
    concerns.push('Sector facing headwinds')
  }
  
  // Check short-term factors
  if (shortTermFactors.volumeChange < 40) {
    concerns.push('Declining or weak trading volumes')
  }
  if (shortTermFactors.priceMomentum < 40) {
    concerns.push('Negative or weak price momentum')
  }
  if (shortTermFactors.breakoutDetection < 40) {
    concerns.push('Trading near 52-week lows')
  }
  if (shortTermFactors.trendAcceleration < 40) {
    concerns.push('Decelerating or negative trend')
  }
  
  return concerns.length > 0 ? concerns : ['Limited concerns identified']
}

// ==================== MAIN EXPORT ====================

export function generateAIExplanation(scores: StockScores): AIExplanation {
  const riskLevel = calculateRiskLevel(scores)
  
  return {
    summary: generateSummary(scores),
    longTermAnalysis: generateLongTermAnalysis(scores.longTermScore, scores.longTermFactors),
    shortTermAnalysis: generateShortTermAnalysis(scores.shortTermScore, scores.shortTermFactors),
    riskLevel,
    riskReasoning: generateRiskReasoning(riskLevel, scores),
    keyStrengths: generateKeyStrengths(scores),
    keyConcerns: generateKeyConcerns(scores)
  }
}
