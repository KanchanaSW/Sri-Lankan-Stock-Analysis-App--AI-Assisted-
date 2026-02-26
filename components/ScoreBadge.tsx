'use client'

import { motion } from 'framer-motion'
import { getScoreColorClass } from '@/lib/scoring'
import Tooltip from './Tooltip'
import { overallScoreTooltips } from '@/lib/tooltipContent'

interface ScoreBadgeProps {
  score: number
  label: string
  type: 'very-long-term' | 'long-term' | 'short-term'
  size?: 'sm' | 'md' | 'lg'
}

export default function ScoreBadge({ score, label, type, size = 'md' }: ScoreBadgeProps) {
  // Determine color based on score
  const getColorClasses = () => {
    if (type === 'very-long-term') {
      if (score >= 80) return 'bg-purple-600 dark:bg-purple-500 text-white'
      if (score >= 60) return 'bg-purple-500 dark:bg-purple-600 text-white'
      if (score >= 40) return 'bg-purple-400 dark:bg-purple-700 text-white'
      return 'bg-purple-300 dark:bg-purple-800 text-white font-medium'
    }
    
    return `${getScoreColorClass(score)} text-white`
  }

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const scoreSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }

  return (
    <motion.div
      className={`inline-flex flex-col items-center rounded-lg ${getColorClasses()} ${sizeClasses[size]} font-semibold`}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <motion.span
        className={`${scoreSizeClasses[size]} font-bold`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {score}
      </motion.span>
      <div className="flex items-center gap-1 text-xs opacity-90">
        <span>{label}</span>
        {overallScoreTooltips[type] && (
          <Tooltip content={overallScoreTooltips[type]} size="xs" />
        )}
      </div>
    </motion.div>
  )
}
