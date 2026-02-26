'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <motion.header
      className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container-custom py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              🇱🇰 Sri Lankan Stock Analysis
            </Link>
          </motion.div>
          <motion.div
            className="flex items-center gap-6"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <nav className="flex gap-6">
              <Link href="/" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/stocks" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                All Stocks
              </Link>
            </nav>
            <ThemeToggle />
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
