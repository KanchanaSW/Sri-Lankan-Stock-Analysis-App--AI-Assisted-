'use client'

import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
  type: 'card' | 'chart' | 'text' | 'stat'
  count?: number
}

// Inline animate prop (not Variants object) to avoid type issues with ease
const shimmerAnimate = {
  opacity: [0.5, 1, 0.5] as number[],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    repeatType: 'loop' as const,
  },
}

export default function LoadingSkeleton({ type, count = 1 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <motion.div
            className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800"
            animate={shimmerAnimate}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              </div>
              <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
            </div>
          </motion.div>
        )
      
      case 'chart':
        return (
          <motion.div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800"
            animate={shimmerAnimate}
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded" />
          </motion.div>
        )
      
      case 'text':
        return (
          <motion.div className="space-y-2" animate={shimmerAnimate}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
          </motion.div>
        )
      
      case 'stat':
        return (
          <motion.div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800"
            animate={shimmerAnimate}
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </motion.div>
        )
      
      default:
        return null
    }
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  )
}
