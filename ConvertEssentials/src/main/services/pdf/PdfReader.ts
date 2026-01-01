import * as fs from 'fs'
import * as path from 'path'

// Dynamic import for pdfjs-dist to handle ESM
let pdfjsLib: typeof import('pdfjs-dist') | null = null

async function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
  }
  return pdfjsLib
}

export interface TextItem {
  text: string
  x: number
  y: number
  width: number
  height: number
  fontName?: string
}

export interface PageContent {
  pageNumber: number
  width: number
  height: number
  textItems: TextItem[]
  fullText: string
}

export interface PdfDocument {
  numPages: number
  pages: PageContent[]
}

export async function readPdf(filePath: string): Promise<PdfDocument> {
  const pdfjs = await getPdfjs()

  const data = fs.readFileSync(filePath)
  const uint8Array = new Uint8Array(data)

  const loadingTask = pdfjs.getDocument({ data: uint8Array })
  const pdf = await loadingTask.promise

  const pages: PageContent[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.0 })
    const textContent = await page.getTextContent()

    const textItems: TextItem[] = textContent.items
      .filter((item): item is import('pdfjs-dist/types/src/display/api').TextItem => 'str' in item)
      .map((item) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
        fontName: item.fontName
      }))

    const fullText = textItems.map((item) => item.text).join(' ')

    pages.push({
      pageNumber: i,
      width: viewport.width,
      height: viewport.height,
      textItems,
      fullText
    })
  }

  return {
    numPages: pdf.numPages,
    pages
  }
}

export function getOutputPath(inputPath: string, outputDir: string | undefined, extension: string): string {
  const baseName = path.basename(inputPath, path.extname(inputPath))
  const dir = outputDir || path.dirname(inputPath)
  return path.join(dir, `${baseName}.${extension}`)
}
