import { Loader2, Zap } from 'lucide-react'
import { useConversionStore } from '../store/conversionStore'

export function ConvertButton() {
  const { selectedFile, conversionType, progress, startConversion } = useConversionStore()

  const isProcessing = progress.status === 'processing'
  const canConvert = selectedFile && conversionType && !isProcessing

  const handleClick = async () => {
    if (canConvert) {
      await startConversion()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!canConvert}
      className={`
        btn w-full py-3 px-6 rounded-xl font-medium text-white
        flex items-center justify-center gap-2
        ${canConvert ? 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl' : 'bg-gray-300 cursor-not-allowed'}
      `}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Converting...
        </>
      ) : (
        <>
          <Zap className="w-5 h-5" />
          Convert Now
        </>
      )}
    </button>
  )
}
