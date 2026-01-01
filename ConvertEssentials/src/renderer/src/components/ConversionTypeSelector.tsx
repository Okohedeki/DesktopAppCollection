import { Table2, FileText, AlignLeft, ScanLine, Receipt } from 'lucide-react'
import { ConversionType, CONVERSION_LABELS, CONVERSION_DESCRIPTIONS } from '../../../shared/types/Conversion'
import { useConversionStore } from '../store/conversionStore'

const conversionTypes: { type: ConversionType; icon: typeof Table2 }[] = [
  { type: 'pdf-to-excel', icon: Table2 },
  { type: 'pdf-to-word', icon: FileText },
  { type: 'pdf-to-text', icon: AlignLeft },
  { type: 'scanned-to-searchable', icon: ScanLine },
  { type: 'invoice-to-table', icon: Receipt }
]

export function ConversionTypeSelector() {
  const { conversionType, setConversionType, progress } = useConversionStore()

  const isProcessing = progress.status === 'processing'

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Convert to:</label>

      <div className="grid grid-cols-5 gap-2">
        {conversionTypes.map(({ type, icon: Icon }) => {
          const isSelected = conversionType === type
          const label = CONVERSION_LABELS[type]
          const description = CONVERSION_DESCRIPTIONS[type]

          return (
            <button
              key={type}
              onClick={() => !isProcessing && setConversionType(type)}
              disabled={isProcessing}
              title={description}
              className={`
                btn flex flex-col items-center gap-2 p-3 rounded-lg border-2
                ${isSelected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'}
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          )
        })}
      </div>

      {conversionType && (
        <p className="text-sm text-gray-500">{CONVERSION_DESCRIPTIONS[conversionType]}</p>
      )}
    </div>
  )
}
