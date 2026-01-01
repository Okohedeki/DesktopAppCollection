import { CheckCircle, XCircle, FolderOpen, FileDown } from 'lucide-react'
import { useConversionStore } from '../store/conversionStore'

export function ResultDisplay() {
  const { result, reset } = useConversionStore()

  if (!result) return null

  const handleOpenFile = async () => {
    if (result.outputPath) {
      await window.electronApi.openFile(result.outputPath)
    }
  }

  const handleOpenFolder = async () => {
    if (result.outputPath) {
      await window.electronApi.openFolder(result.outputPath)
    }
  }

  if (!result.success) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-800">Conversion failed</p>
            <p className="text-sm text-red-600 mt-1">{result.error}</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Try again
        </button>
      </div>
    )
  }

  const fileName = result.outputPath?.split(/[/\\]/).pop()

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-green-800">Conversion complete!</p>
          <p className="text-sm text-green-600 mt-1">{fileName}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleOpenFile}
          className="btn flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm"
        >
          <FileDown className="w-4 h-4" />
          Open File
        </button>
        <button
          onClick={handleOpenFolder}
          className="btn flex items-center justify-center gap-2 py-2 px-4 bg-white border border-green-300 hover:bg-green-50 text-green-700 rounded-lg font-medium text-sm"
        >
          <FolderOpen className="w-4 h-4" />
          Show in Folder
        </button>
      </div>

      <button
        onClick={reset}
        className="mt-3 w-full text-sm text-green-600 hover:text-green-800 font-medium"
      >
        Convert another file
      </button>
    </div>
  )
}
