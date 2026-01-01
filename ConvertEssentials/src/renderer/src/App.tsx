import { useEffect } from 'react'
import { Header } from './components/layout/Header'
import { FileDropZone } from './components/FileDropZone'
import { ConversionTypeSelector } from './components/ConversionTypeSelector'
import { ConvertButton } from './components/ConvertButton'
import { ProgressIndicator } from './components/ProgressIndicator'
import { ResultDisplay } from './components/ResultDisplay'
import { useConversionStore } from './store/conversionStore'

function App() {
  const { progress, subscribeToProgress } = useConversionStore()

  useEffect(() => {
    const unsubscribe = subscribeToProgress()
    return () => unsubscribe()
  }, [subscribeToProgress])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <FileDropZone />

          <ConversionTypeSelector />

          <ConvertButton />

          {progress.status !== 'idle' && <ProgressIndicator />}

          {progress.status === 'completed' && <ResultDisplay />}
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>All conversions happen locally on your device.</p>
          <p>Your files never leave your computer.</p>
        </footer>
      </main>
    </div>
  )
}

export default App
