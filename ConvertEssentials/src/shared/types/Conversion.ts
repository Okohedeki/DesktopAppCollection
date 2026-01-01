export type ConversionType =
  | 'pdf-to-excel'
  | 'pdf-to-word'
  | 'pdf-to-text'
  | 'scanned-to-searchable'
  | 'invoice-to-table'

export type ConversionStatus =
  | 'idle'
  | 'processing'
  | 'completed'
  | 'error'

export interface ConversionProgress {
  status: ConversionStatus
  progress: number // 0-100
  currentPage?: number
  totalPages?: number
  message?: string
}

export interface ConversionResult {
  success: boolean
  outputPath?: string
  error?: string
}

export interface ConversionRequest {
  type: ConversionType
  inputPath: string
  outputDir?: string
}

export const CONVERSION_LABELS: Record<ConversionType, string> = {
  'pdf-to-excel': 'Excel',
  'pdf-to-word': 'Word',
  'pdf-to-text': 'Text',
  'scanned-to-searchable': 'OCR',
  'invoice-to-table': 'Invoice'
}

export const CONVERSION_DESCRIPTIONS: Record<ConversionType, string> = {
  'pdf-to-excel': 'Convert PDF tables to Excel spreadsheet',
  'pdf-to-word': 'Convert PDF to editable Word document',
  'pdf-to-text': 'Extract clean text from PDF',
  'scanned-to-searchable': 'Make scanned PDF searchable with OCR',
  'invoice-to-table': 'Extract invoice data to Excel/CSV'
}
