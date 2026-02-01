import DisclaimerBanner from '@/components/DisclaimerBanner'
import StockCard from '@/components/StockCard'
import { mockMarketOverview } from '@/lib/mockData'
import { getTopLongTermStocks, getTopShortTermStocks } from '@/lib/stockService'

export default function Home() {
  // Fetch top stocks using the stock service
  const topLongTerm = getTopLongTermStocks(5)
  const topShortTerm = getTopShortTermStocks(5)

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
              <p className="text-3xl font-bold text-gray-900">{mockMarketOverview.totalStocks}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Gainers</p>
              <p className="text-3xl font-bold text-green-600">{mockMarketOverview.marketsUp}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Losers</p>
              <p className="text-3xl font-bold text-red-600">{mockMarketOverview.marketsDown}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Volume</p>
              <p className="text-3xl font-bold text-gray-900">{mockMarketOverview.totalVolume}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Last updated: {mockMarketOverview.lastUpdated}</p>
        </div>
      </section>

      {/* Long-Term Picks */}
      <section className="py-12">
        <div className="container-custom">
          <div className="mb-6">
            <h2 className="mb-2">Top Long-Term Picks</h2>
            <p className="text-gray-600">Stable stocks with consistent performance, suitable for long-term holding</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {topLongTerm.map((stock) => (
              <StockCard key={stock.id} stock={stock} type="long-term" showExplanation={true} />
            ))}
          </div>
        </div>
      </section>

      {/* Short-Term Opportunities */}
      <section className="bg-gray-50 py-12">
        <div className="container-custom">
          <div className="mb-6">
            <h2 className="mb-2">Top Short-Term Opportunities</h2>
            <p className="text-gray-600">High-momentum stocks showing strong recent performance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {topShortTerm.map((stock) => (
              <StockCard key={stock.id} stock={stock} type="short-term" showExplanation={true} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
