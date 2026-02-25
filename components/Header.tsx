import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="container-custom py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            🇱🇰 Sri Lankan Stock Analysis
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex gap-6">
              <Link href="/" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/stocks" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                All Stocks
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
