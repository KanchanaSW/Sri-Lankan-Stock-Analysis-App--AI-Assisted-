interface ScoreBadgeProps {
  score: number
  label: string
  type: 'very-long-term' | 'long-term' | 'short-term'
  size?: 'sm' | 'md' | 'lg'
}

export default function ScoreBadge({ score, label, type, size = 'md' }: ScoreBadgeProps) {
  // Determine color based on score
  const getColorClasses = () => {
    if (score >= 80) {
      if (type === 'very-long-term') return 'bg-purple-500 text-white'
      return type === 'long-term' 
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white'
    }
    if (score >= 60) {
      if (type === 'very-long-term') return 'bg-purple-400 text-white'
      return type === 'long-term'
        ? 'bg-green-400 text-white'
        : 'bg-red-400 text-white'
    }
    if (score >= 40) {
      return 'bg-amber-400 text-white'
    }
    return 'bg-gray-400 text-white'
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
