import { FileText } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="container mx-auto max-w-2xl flex items-center gap-3">
        <div className="p-2 bg-primary-500 rounded-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">ConvertEssentials</h1>
          <p className="text-sm text-gray-500">Local document converter</p>
        </div>
      </div>
    </header>
  )
}
