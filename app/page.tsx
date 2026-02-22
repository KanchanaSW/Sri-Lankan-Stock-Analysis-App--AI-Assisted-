'use client'

import DisclaimerBanner from '@/components/DisclaimerBanner'
import StockCard from '@/components/StockCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { 
  useAllStocks, 
  useMarketOverview, 
  getTopLongTermStocksClient, 
  getTopShortTermStocksClient,
  getTopVeryLongTermStocksClient
} from '@/lib/convexService'

export default function Home() {
  const { stocks, isLoading: stocksLoading } = useAllStocks();
  const { overview, isLoading: overviewLoading } = useMarketOverview();
  
  const isLoading = stocksLoading || overviewLoading;
  
  // Get top stocks
  const topVeryLongTerm = stocks.length > 0 ? getTopVeryLongTermStocksClient(stocks, 5) : [];
  const topLongTerm = stocks.length > 0 ? getTopLongTermStocksClient(stocks, 5) : [];
  const topShortTerm = stocks.length > 0 ? getTopShortTermStocksClient(stocks, 5) : [];

  // Show error if no overview data
  if (!overview && !overviewLoading) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-900 font-semibold mb-2">Convex Not Configured</h3>
          <p className="text-red-700 mb-4">
            Please run <code className="bg-red-100 px-2 py-1 rounded">npx convex dev</code> to set up your Convex backend,
            then run <code className="bg-red-100 px-2 py-1 rounded">npm run seed</code> to populate initial data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DisclaimerBanner />
      
      {/* Market Overview */}
      <section className="bg-gray-50 py-12">
        <div className="container-custom">
          <h2 className="mb-6">Market Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Stocks</p>
              {isLoading ? (
                <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{overview?.totalStocks ?? 0}</p>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Gainers</p>
              {isLoading ? (
                <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-green-600">{overview?.marketsUp ?? 0}</p>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Losers</p>
              {isLoading ? (
                <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-red-600">{overview?.marketsDown ?? 0}</p>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Volume</p>
              {isLoading ? (
                <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{overview?.totalVolume ?? 'N/A'}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Last updated: {overview?.lastUpdated ?? 'N/A'}</p>
        </div>
      </section>

      {/* Very Long-Term Picks */}
      <section className="bg-purple-50 py-12">
        <div className="container-custom">
          <div className="mb-6">
            <h2 className="mb-2 text-purple-900">Top Very Long-Term Picks (Buy & Hold)</h2>
            <p className="text-purple-700">Exceptional 5-year stability and returns, ideal for multi-year holding</p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <LoadingSkeleton type="card" count={5} />
            </div>
          ) : topVeryLongTerm.length === 0 ? (
            <div className="text-center py-12 text-purple-500">
              No stocks available. Please seed the database first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {topVeryLongTerm.map((stock) => (
                <StockCard key={stock.id} stock={stock} type="very-long-term" showExplanation={true} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Long-Term Picks */}
      <section className="py-12">
        <div className="container-custom">
          <div className="mb-6">
            <h2 className="mb-2">Top Long-Term Picks</h2>
            <p className="text-gray-600">Stable stocks with consistent performance, suitable for long-term holding</p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <LoadingSkeleton type="card" count={5} />
            </div>
          ) : topLongTerm.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No stocks available. Please seed the database first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {topLongTerm.map((stock) => (
                <StockCard key={stock.id} stock={stock} type="long-term" showExplanation={true} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Short-Term Opportunities */}
      <section className="bg-gray-50 py-12">
        <div className="container-custom">
          <div className="mb-6">
            <h2 className="mb-2">Top Short-Term Opportunities</h2>
            <p className="text-gray-600">High-momentum stocks showing strong recent performance</p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <LoadingSkeleton type="card" count={5} />
            </div>
          ) : topShortTerm.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No stocks available. Please seed the database first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {topShortTerm.map((stock) => (
                <StockCard key={stock.id} stock={stock} type="short-term" showExplanation={true} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
