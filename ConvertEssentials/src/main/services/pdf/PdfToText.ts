import * as fs from 'fs'
import { readPdf, getOutputPath } from './PdfReader'
import { ConversionResult, ConversionProgress } from '../../../shared/types/Conversion'

type ProgressCallback = (progress: ConversionProgress) => void

export async function convertPdfToText(
  inputPath: string,
  outputDir: string | undefined,
  onProgress: ProgressCallback
): Promise<ConversionResult> {
  try {
    onProgress({
      status: 'processing',
      progress: 10,
      message: 'Reading PDF...'
    })

    const pdf = await readPdf(inputPath)
    const totalPages = pdf.numPages

    onProgress({
      status: 'processing',
      progress: 30,
      totalPages,
      message: `Processing ${totalPages} pages...`
    })

    // Clean and combine text from all pages
    const cleanedText = pdf.pages
      .map((page, index) => {
        onProgress({
          status: 'processing',
          progress: 30 + Math.floor((index / totalPages) * 50),
          currentPage: index + 1,
          totalPages,
          message: `Processing page ${index + 1} of ${totalPages}...`
        })

        return cleanText(page.fullText, page.pageNumber, totalPages)
      })
      .join('\n\n')

    onProgress({
      status: 'processing',
      progress: 90,
      message: 'Saving text file...'
    })

    const outputPath = getOutputPath(inputPath, outputDir, 'txt')
    fs.writeFileSync(outputPath, cleanedText, 'utf-8')

    onProgress({
      status: 'completed',
      progress: 100,
      message: 'Conversion complete!'
    })

    return {
      success: true,
      outputPath
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert PDF to text'
    }
  }
}

function cleanText(text: string, pageNum: number, totalPages: number): string {
  let cleaned = text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove common header/footer patterns (page numbers)
    .replace(/\b(Page|Pg\.?)\s*\d+\s*(of\s*\d+)?\b/gi, '')
    // Remove standalone numbers that are likely page numbers
    .replace(/^\s*\d+\s*$/gm, '')
    // Clean up multiple spaces
    .replace(/  +/g, ' ')
    // Trim
    .trim()

  // Add page marker for multi-page documents
  if (totalPages > 1) {
    cleaned = `--- Page ${pageNum} ---\n${cleaned}`
  }

  return cleaned
}
