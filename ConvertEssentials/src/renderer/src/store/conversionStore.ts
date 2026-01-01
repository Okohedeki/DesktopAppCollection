import { create } from 'zustand'
import { ConversionType, ConversionProgress, ConversionResult } from '../../../shared/types/Conversion'

interface ConversionState {
  selectedFile: string | null
  conversionType: ConversionType | null
  progress: ConversionProgress
  result: ConversionResult | null

  setSelectedFile: (file: string | null) => void
  setConversionType: (type: ConversionType) => void
  startConversion: () => Promise<void>
  reset: () => void
  subscribeToProgress: () => () => void
}

const initialProgress: ConversionProgress = {
  status: 'idle',
  progress: 0
}

export const useConversionStore = create<ConversionState>((set, get) => ({
  selectedFile: null,
  conversionType: 'pdf-to-excel',
  progress: initialProgress,
  result: null,

  setSelectedFile: (file) => {
    set({ selectedFile: file, result: null, progress: initialProgress })
  },

  setConversionType: (type) => {
    set({ conversionType: type })
  },

  startConversion: async () => {
    const { selectedFile, conversionType } = get()

    if (!selectedFile || !conversionType) return

    set({
      progress: { status: 'processing', progress: 0, message: 'Starting...' },
      result: null
    })

    try {
      const result = await window.electronApi.startConversion({
        type: conversionType,
        inputPath: selectedFile
      })

      set({ result })

      if (!result.success) {
        set({
          progress: {
            status: 'error',
            progress: 0,
            message: result.error || 'Conversion failed'
          }
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({
        progress: { status: 'error', progress: 0, message: errorMessage },
        result: { success: false, error: errorMessage }
      })
    }
  },

  reset: () => {
    set({
      selectedFile: null,
      progress: initialProgress,
      result: null
    })
  },

  subscribeToProgress: () => {
    const unsubscribe = window.electronApi.onConversionProgress((progress) => {
      set({ progress })
    })
    return unsubscribe
  }
}))
