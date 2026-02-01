interface LoadingSkeletonProps {
  type: 'card' | 'chart' | 'text' | 'stat'
  count?: number
}

export default function LoadingSkeleton({ type, count = 1 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-8 w-12 bg-gray-200 rounded"></div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        )
      
      case 'chart':
        return (
          <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        )
      
      case 'text':
        return (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        )
      
      case 'stat':
        return (
          <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
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
