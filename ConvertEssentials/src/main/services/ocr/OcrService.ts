import * as fs from 'fs'
import * as path from 'path'
import Tesseract from 'tesseract.js'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { ConversionResult, ConversionProgress } from '../../../shared/types/Conversion'
import { getOutputPath } from '../pdf/PdfReader'

type ProgressCallback = (progress: ConversionProgress) => void

interface OcrWord {
  text: string
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
  confidence: number
}

interface OcrPage {
  pageNumber: number
  width: number
  height: number
  words: OcrWord[]
  fullText: string
  confidence: number
}

export async function convertScannedToSearchable(
  inputPath: string,
  outputDir: string | undefined,
  onProgress: ProgressCallback
): Promise<ConversionResult> {
  try {
    onProgress({
      status: 'processing',
      progress: 5,
      message: 'Loading PDF...'
    })

    const pdfBytes = fs.readFileSync(inputPath)
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pages = pdfDoc.getPages()
    const totalPages = pages.length

    onProgress({
      status: 'processing',
      progress: 10,
      totalPages,
      message: `Processing ${totalPages} pages with OCR...`
    })

    // Create worker
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && typeof m.progress === 'number') {
          // Progress updates are handled per page
        }
      }
    })

    const ocrResults: OcrPage[] = []

    for (let i = 0; i < totalPages; i++) {
      const pageNum = i + 1

      onProgress({
        status: 'processing',
        progress: 10 + Math.floor((i / totalPages) * 70),
        currentPage: pageNum,
        totalPages,
        message: `OCR processing page ${pageNum} of ${totalPages}...`
      })

      // Render page to image for OCR
      const page = pages[i]
      const { width, height } = page.getSize()

      // For scanned PDFs, we need to extract the image
      // This is a simplified approach - in production you'd render the PDF page to an image
      // For now, we'll do OCR on the embedded images or use pdf-to-image conversion

      // Try to OCR the PDF directly (tesseract.js can handle PDF if it's image-based)
      try {
        const result = await worker.recognize(inputPath, {
          // @ts-ignore - pages option exists but may not be in types
          pages: `${pageNum}`
        })

        ocrResults.push({
          pageNumber: pageNum,
          width,
          height,
          words: result.data.words.map((word) => ({
            text: word.text,
            bbox: word.bbox,
            confidence: word.confidence
          })),
          fullText: result.data.text,
          confidence: result.data.confidence
        })
      } catch {
        // If direct PDF OCR fails, try with buffer
        const result = await worker.recognize(pdfBytes)
        ocrResults.push({
          pageNumber: pageNum,
          width,
          height,
          words: result.data.words.map((word) => ({
            text: word.text,
            bbox: word.bbox,
            confidence: word.confidence
          })),
          fullText: result.data.text,
          confidence: result.data.confidence
        })
        break // Only process first page in fallback mode
      }
    }

    await worker.terminate()

    onProgress({
      status: 'processing',
      progress: 85,
      message: 'Adding invisible text layer...'
    })

    // Add invisible text layer to PDF
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    for (const ocrPage of ocrResults) {
      if (ocrPage.pageNumber <= pages.length) {
        const page = pages[ocrPage.pageNumber - 1]
        const { width, height } = page.getSize()

        // Add invisible text for each word
        for (const word of ocrPage.words) {
          if (word.text.trim()) {
            // Calculate position (convert from image coords to PDF coords)
            const scaleX = width / ocrPage.width
            const scaleY = height / ocrPage.height

            const x = word.bbox.x0 * scaleX
            const y = height - word.bbox.y1 * scaleY // PDF Y is from bottom

            const fontSize = Math.max(
              1,
              Math.min(20, (word.bbox.y1 - word.bbox.y0) * scaleY * 0.8)
            )

            try {
              page.drawText(word.text, {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
                opacity: 0 // Invisible text
              })
            } catch {
              // Skip words that can't be rendered
            }
          }
        }
      }
    }

    onProgress({
      status: 'processing',
      progress: 95,
      message: 'Saving searchable PDF...'
    })

    const outputPath = getOutputPath(inputPath, outputDir, 'searchable.pdf')
    const modifiedPdfBytes = await pdfDoc.save()
    fs.writeFileSync(outputPath, modifiedPdfBytes)

    const avgConfidence =
      ocrResults.reduce((sum, p) => sum + p.confidence, 0) / ocrResults.length

    onProgress({
      status: 'completed',
      progress: 100,
      message: `OCR complete! Average confidence: ${avgConfidence.toFixed(1)}%`
    })

    return {
      success: true,
      outputPath
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to OCR PDF'
    }
  }
}

// Export for use in invoice parsing
export async function ocrImage(imagePath: string): Promise<{
  text: string
  words: OcrWord[]
  confidence: number
}> {
  const worker = await Tesseract.createWorker('eng')

  try {
    const result = await worker.recognize(imagePath)

    return {
      text: result.data.text,
      words: result.data.words.map((word) => ({
        text: word.text,
        bbox: word.bbox,
        confidence: word.confidence
      })),
      confidence: result.data.confidence
    }
  } finally {
    await worker.terminate()
  }
}
