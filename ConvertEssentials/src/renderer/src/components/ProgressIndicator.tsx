import { useConversionStore } from '../store/conversionStore'

export function ProgressIndicator() {
  const { progress } = useConversionStore()

  const getStatusColor = () => {
    switch (progress.status) {
      case 'processing':
        return 'bg-primary-500'
      case 'completed':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{progress.message || 'Processing...'}</span>
        <span className="font-medium text-gray-900">{progress.progress}%</span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`progress-bar h-full ${getStatusColor()} rounded-full`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {progress.currentPage && progress.totalPages && (
        <p className="text-xs text-gray-500">
          Page {progress.currentPage} of {progress.totalPages}
        </p>
      )}
    </div>
  )
}
