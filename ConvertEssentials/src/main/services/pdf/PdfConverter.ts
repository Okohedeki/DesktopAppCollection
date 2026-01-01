import { ConversionRequest, ConversionResult, ConversionProgress } from '../../../shared/types/Conversion'
import { convertPdfToText } from './PdfToText'
import { convertPdfToWord } from './PdfToWord'
import { convertPdfToExcel } from './PdfToExcel'
import { convertScannedToSearchable } from '../ocr/OcrService'
import { parseInvoice } from '../invoice/InvoiceParser'

type ProgressCallback = (progress: ConversionProgress) => void

export async function convertPdf(
  request: ConversionRequest,
  onProgress: ProgressCallback
): Promise<ConversionResult> {
  onProgress({
    status: 'processing',
    progress: 0,
    message: 'Starting conversion...'
  })

  try {
    switch (request.type) {
      case 'pdf-to-text':
        return await convertPdfToText(request.inputPath, request.outputDir, onProgress)

      case 'pdf-to-word':
        return await convertPdfToWord(request.inputPath, request.outputDir, onProgress)

      case 'pdf-to-excel':
        return await convertPdfToExcel(request.inputPath, request.outputDir, onProgress)

      case 'scanned-to-searchable':
        return await convertScannedToSearchable(request.inputPath, request.outputDir, onProgress)

      case 'invoice-to-table':
        return await parseInvoice(request.inputPath, request.outputDir, onProgress)

      default:
        return {
          success: false,
          error: `Unknown conversion type: ${request.type}`
        }
    }
  } catch (error) {
    onProgress({
      status: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Conversion failed'
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
