import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container-custom py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
            🇱🇰 Sri Lankan Stock Analysis
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/stocks" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              All Stocks
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
