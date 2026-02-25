export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500">
      <div className="container-custom py-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400 dark:text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong className="font-semibold text-amber-900 dark:text-amber-100">Disclaimer:</strong> This platform provides stock market analysis for educational purposes only and does not constitute financial or investment advice. Always consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
