import * as fs from 'fs'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { readPdf, getOutputPath } from './PdfReader'
import { ConversionResult, ConversionProgress } from '../../../shared/types/Conversion'

type ProgressCallback = (progress: ConversionProgress) => void

export async function convertPdfToWord(
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
      message: `Converting ${totalPages} pages to Word...`
    })

    const sections: { children: Paragraph[] }[] = []

    for (let i = 0; i < pdf.pages.length; i++) {
      const page = pdf.pages[i]

      onProgress({
        status: 'processing',
        progress: 30 + Math.floor((i / totalPages) * 50),
        currentPage: i + 1,
        totalPages,
        message: `Converting page ${i + 1} of ${totalPages}...`
      })

      const paragraphs = extractParagraphs(page.fullText, page.textItems)
      sections.push({ children: paragraphs })
    }

    onProgress({
      status: 'processing',
      progress: 85,
      message: 'Creating Word document...'
    })

    const doc = new Document({
      sections
    })

    onProgress({
      status: 'processing',
      progress: 90,
      message: 'Saving Word document...'
    })

    const outputPath = getOutputPath(inputPath, outputDir, 'docx')
    const buffer = await Packer.toBuffer(doc)
    fs.writeFileSync(outputPath, buffer)

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
      error: error instanceof Error ? error.message : 'Failed to convert PDF to Word'
    }
  }
}

function extractParagraphs(fullText: string, textItems: { text: string; y: number }[]): Paragraph[] {
  const paragraphs: Paragraph[] = []

  // Group text items by approximate Y position (same line)
  const lines: { y: number; text: string }[] = []
  let currentLine = { y: -1, text: '' }
  const lineThreshold = 5 // Y difference threshold for same line

  for (const item of textItems) {
    if (currentLine.y === -1 || Math.abs(item.y - currentLine.y) < lineThreshold) {
      currentLine.text += item.text + ' '
      currentLine.y = item.y
    } else {
      if (currentLine.text.trim()) {
        lines.push({ y: currentLine.y, text: currentLine.text.trim() })
      }
      currentLine = { y: item.y, text: item.text + ' ' }
    }
  }

  // Add last line
  if (currentLine.text.trim()) {
    lines.push({ y: currentLine.y, text: currentLine.text.trim() })
  }

  // Group lines into paragraphs (blank lines separate paragraphs)
  let currentParagraphText = ''

  for (const line of lines) {
    const trimmedLine = line.text.trim()

    if (!trimmedLine) {
      if (currentParagraphText) {
        paragraphs.push(createParagraph(currentParagraphText))
        currentParagraphText = ''
      }
    } else {
      // Detect potential headings (short lines, possibly uppercase)
      const isHeading = isLikelyHeading(trimmedLine)

      if (isHeading && currentParagraphText) {
        paragraphs.push(createParagraph(currentParagraphText))
        currentParagraphText = ''
      }

      if (isHeading) {
        paragraphs.push(createHeading(trimmedLine))
      } else {
        currentParagraphText += (currentParagraphText ? ' ' : '') + trimmedLine
      }
    }
  }

  // Add remaining paragraph
  if (currentParagraphText) {
    paragraphs.push(createParagraph(currentParagraphText))
  }

  // If no paragraphs extracted, create one from full text
  if (paragraphs.length === 0 && fullText.trim()) {
    paragraphs.push(createParagraph(fullText.trim()))
  }

  return paragraphs
}

function isLikelyHeading(text: string): boolean {
  // Short text, all caps, or ends with colon
  return (
    (text.length < 50 && text === text.toUpperCase() && /[A-Z]/.test(text)) ||
    (text.length < 60 && text.endsWith(':'))
  )
}

function createParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: 24 // 12pt
      })
    ],
    spacing: {
      after: 200
    }
  })
}

function createHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28 // 14pt
      })
    ],
    heading: HeadingLevel.HEADING_2,
    spacing: {
      before: 400,
      after: 200
    }
  })
}
