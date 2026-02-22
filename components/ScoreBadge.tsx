import { getScoreColorClass } from '@/lib/scoring'

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
      if (score >= 80) return 'bg-purple-600 text-white'
      if (score >= 60) return 'bg-purple-500 text-white'
      if (score >= 40) return 'bg-purple-400 text-white'
      return 'bg-purple-300 text-white'
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
    <div className={`inline-flex flex-col items-center rounded-lg ${getColorClasses()} ${sizeClasses[size]} font-semibold`}>
      <span className={`${scoreSizeClasses[size]} font-bold`}>{score}</span>
      <span className="text-xs opacity-90">{label}</span>
    </div>
  )
}
