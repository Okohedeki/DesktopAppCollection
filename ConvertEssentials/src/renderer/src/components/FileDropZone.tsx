import { useCallback, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { useConversionStore } from '../store/conversionStore'

export function FileDropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const { selectedFile, setSelectedFile, progress } = useConversionStore()

  const isProcessing = progress.status === 'processing'

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!isProcessing) setIsDragging(true)
  }, [isProcessing])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (isProcessing) return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          setSelectedFile(file.path)
        }
      }
    },
    [isProcessing, setSelectedFile]
  )

  const handleClick = useCallback(async () => {
    if (isProcessing) return

    const filePath = await window.electronApi.selectFile({
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    })

    if (filePath) {
      setSelectedFile(filePath)
    }
  }, [isProcessing, setSelectedFile])

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedFile(null)
    },
    [setSelectedFile]
  )

  const fileName = selectedFile ? selectedFile.split(/[/\\]/).pop() : null

  return (
    <div
      className={`
        drop-zone relative border-2 border-dashed rounded-xl p-8
        flex flex-col items-center justify-center gap-4
        cursor-pointer transition-all duration-200
        ${isDragging ? 'active border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        ${selectedFile ? 'border-green-500 bg-green-50' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {selectedFile ? (
        <>
          <div className="p-3 bg-green-100 rounded-full">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">{fileName}</p>
            <p className="text-sm text-gray-500">Click to change file</p>
          </div>
          <button
            onClick={handleRemove}
            disabled={isProcessing}
            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          <div className="p-3 bg-gray-100 rounded-full">
            <Upload className="w-8 h-8 text-gray-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">Drop your PDF here</p>
            <p className="text-sm text-gray-500">or click to browse</p>
          </div>
        </>
      )}
    </div>
  )
}
