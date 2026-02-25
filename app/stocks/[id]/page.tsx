'use client'

import { useParams, useRouter } from 'next/navigation'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import RiskIndicator from '@/components/RiskIndicator'
import ScoreBreakdown from '@/components/ScoreBreakdown'
import PriceChart from '@/components/charts/PriceChart'
import VolumeChart from '@/components/charts/VolumeChart'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { useStockById } from '@/lib/convexService'
import { formatMarketCap } from '@/lib/stockService'

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string;
  const { stock, isLoading } = useStockById(id);

  if (isLoading) {
    return (
      <div>
        <DisclaimerBanner />
        <section className="py-12">
          <div className="container-custom">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-64 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg h-32"></div>
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg h-32"></div>
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg h-32"></div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg h-64 mb-8"></div>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg h-96"></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="container-custom py-12">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-6">
          <h3 className="text-yellow-900 dark:text-yellow-400 font-semibold mb-2">Stock Not Found</h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            The requested stock was not found in the database. Please make sure you have seeded the database with initial data.
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-500">
            Run: <code className="bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded text-yellow-900 dark:text-yellow-200">npm run seed</code>
          </p>
        </div>
      </div>
    )
  }

  const { scores, explanation } = stock

  return (
    <div>
      <DisclaimerBanner />
      
      <section className="py-12">
        <div className="container-custom">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <svg 
              className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          {/* Stock Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="mb-2 text-gray-900 dark:text-white">{stock.symbol}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{stock.name}</p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stock.sector}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Market Cap: {formatMarketCap(stock.marketCap)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">Rs. {stock.currentPrice.toFixed(2)}</p>
                <p className={`text-lg font-medium ${stock.priceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stock.priceChange >= 0 ? '+' : ''}{stock.priceChange.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  52W: Rs. {stock.weekLow52.toFixed(2)} - Rs. {stock.weekHigh52.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Scores & Risk */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Very Long-Term Score</p>
              <p className="text-5xl font-bold text-purple-600 dark:text-purple-400">{scores.veryLongTermScore}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Out of 100</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Long-Term Stability Score</p>
              <p className="text-5xl font-bold text-green-600 dark:text-green-400">{scores.longTermScore}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Out of 100</p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Short-Term Momentum Score</p>
              <p className="text-5xl font-bold text-red-600 dark:text-red-400">{scores.shortTermScore}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Out of 100</p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex flex-col justify-center shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Risk Assessment</p>
              <RiskIndicator level={explanation.riskLevel} size="lg" />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">{explanation.riskReasoning}</p>
            </div>
          </div>

          {/* AI-Generated Explanation */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-lg p-6 mb-8 shadow-sm">
            <h3 className="mb-3 text-blue-900 dark:text-blue-300">AI-Assisted Analysis</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Summary</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{explanation.summary}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Very Long-Term Analysis</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed">{explanation.veryLongTermAnalysis || "Not available"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Long-Term Analysis</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed">{explanation.longTermAnalysis}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Short-Term Analysis</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed">{explanation.shortTermAnalysis}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-200 dark:border-blue-800/50">
                <div>
                  <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Key Strengths</h4>
                  <ul className="space-y-1">
                    {explanation.keyStrengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Key Concerns</h4>
                  <ul className="space-y-1">
                    {explanation.keyConcerns.map((concern, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                        <span>{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <ScoreBreakdown type="very-long-term" factors={scores.veryLongTermFactors} />
            <ScoreBreakdown type="long-term" factors={scores.longTermFactors} />
            <ScoreBreakdown type="short-term" factors={scores.shortTermFactors} />
          </div>

          {/* Price Chart */}
          <div className="mb-6">
            <PriceChart 
              data={stock.historicalData} 
              title={`${stock.symbol} Price History (${stock.historicalData.length} days)`}
              height={350}
            />
          </div>

          {/* Volume Chart */}
          <div>
            <VolumeChart 
              data={stock.historicalData} 
              title={`${stock.symbol} Trading Volume (${stock.historicalData.length} days)`}
              height={350}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
