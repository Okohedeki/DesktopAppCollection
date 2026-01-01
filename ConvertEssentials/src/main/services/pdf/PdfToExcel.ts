import * as fs from 'fs'
import ExcelJS from 'exceljs'
import { readPdf, getOutputPath, TextItem } from './PdfReader'
import { ConversionResult, ConversionProgress } from '../../../shared/types/Conversion'

type ProgressCallback = (progress: ConversionProgress) => void

interface TableCell {
  text: string
  row: number
  col: number
}

interface DetectedTable {
  cells: TableCell[][]
  startY: number
  endY: number
}

export async function convertPdfToExcel(
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
      message: `Detecting tables in ${totalPages} pages...`
    })

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'ConvertEssentials'
    workbook.created = new Date()

    let sheetsCreated = 0

    for (let i = 0; i < pdf.pages.length; i++) {
      const page = pdf.pages[i]

      onProgress({
        status: 'processing',
        progress: 30 + Math.floor((i / totalPages) * 50),
        currentPage: i + 1,
        totalPages,
        message: `Processing page ${i + 1} of ${totalPages}...`
      })

      const tables = detectTables(page.textItems, page.height)

      if (tables.length > 0) {
        for (const table of tables) {
          sheetsCreated++
          const sheetName = `Page${i + 1}_Table${tables.indexOf(table) + 1}`
          const worksheet = workbook.addWorksheet(sheetName.substring(0, 31)) // Max 31 chars

          for (let rowIdx = 0; rowIdx < table.cells.length; rowIdx++) {
            const row = table.cells[rowIdx]
            for (let colIdx = 0; colIdx < row.length; colIdx++) {
              const cell = row[colIdx]
              worksheet.getCell(rowIdx + 1, colIdx + 1).value = cell.text
            }
          }

          // Auto-fit columns
          worksheet.columns.forEach((column) => {
            let maxLength = 10
            column.eachCell?.({ includeEmpty: false }, (cell) => {
              const cellValue = cell.value?.toString() || ''
              maxLength = Math.max(maxLength, cellValue.length)
            })
            column.width = Math.min(maxLength + 2, 50)
          })
        }
      } else {
        // No tables detected, create a sheet with all text items
        sheetsCreated++
        const worksheet = workbook.addWorksheet(`Page${i + 1}`.substring(0, 31))

        // Group by rows based on Y position
        const rows = groupTextByRows(page.textItems)
        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
          for (let colIdx = 0; colIdx < rows[rowIdx].length; colIdx++) {
            worksheet.getCell(rowIdx + 1, colIdx + 1).value = rows[rowIdx][colIdx]
          }
        }

        worksheet.columns.forEach((column) => {
          let maxLength = 10
          column.eachCell?.({ includeEmpty: false }, (cell) => {
            const cellValue = cell.value?.toString() || ''
            maxLength = Math.max(maxLength, cellValue.length)
          })
          column.width = Math.min(maxLength + 2, 50)
        })
      }
    }

    if (sheetsCreated === 0) {
      // Create at least one sheet with raw text
      const worksheet = workbook.addWorksheet('Content')
      let row = 1
      for (const page of pdf.pages) {
        worksheet.getCell(row, 1).value = page.fullText
        row++
      }
    }

    onProgress({
      status: 'processing',
      progress: 90,
      message: 'Saving Excel file...'
    })

    const outputPath = getOutputPath(inputPath, outputDir, 'xlsx')
    await workbook.xlsx.writeFile(outputPath)

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
      error: error instanceof Error ? error.message : 'Failed to convert PDF to Excel'
    }
  }
}

function detectTables(textItems: TextItem[], pageHeight: number): DetectedTable[] {
  if (textItems.length === 0) return []

  // Group items by Y position (rows)
  const rowGroups: Map<number, TextItem[]> = new Map()
  const yThreshold = 5 // Items within this Y range are considered same row

  for (const item of textItems) {
    const normalizedY = Math.round(item.y / yThreshold) * yThreshold
    if (!rowGroups.has(normalizedY)) {
      rowGroups.set(normalizedY, [])
    }
    rowGroups.get(normalizedY)!.push(item)
  }

  // Sort rows by Y position (top to bottom in PDF coordinate space)
  const sortedYs = Array.from(rowGroups.keys()).sort((a, b) => b - a) // Descending for PDF coords

  // Detect table-like structures (multiple items per row with consistent columns)
  const potentialTableRows: { y: number; items: TextItem[] }[] = []

  for (const y of sortedYs) {
    const items = rowGroups.get(y)!.sort((a, b) => a.x - b.x)
    if (items.length >= 2) {
      // At least 2 items in row suggests table structure
      potentialTableRows.push({ y, items })
    }
  }

  if (potentialTableRows.length < 2) return []

  // Convert to table structure
  const tables: DetectedTable[] = []

  // Find column positions based on X coordinates
  const allXPositions: number[] = []
  for (const row of potentialTableRows) {
    for (const item of row.items) {
      allXPositions.push(item.x)
    }
  }

  // Cluster X positions to determine columns
  const columnPositions = clusterPositions(allXPositions, 20)

  // Build table cells
  const cells: TableCell[][] = []

  for (let rowIdx = 0; rowIdx < potentialTableRows.length; rowIdx++) {
    const row = potentialTableRows[rowIdx]
    const rowCells: TableCell[] = []

    for (let colIdx = 0; colIdx < columnPositions.length; colIdx++) {
      const colX = columnPositions[colIdx]
      const nextColX = columnPositions[colIdx + 1] ?? Infinity

      // Find items in this column
      const cellItems = row.items.filter(
        (item) => item.x >= colX - 10 && item.x < nextColX - 10
      )

      rowCells.push({
        text: cellItems.map((item) => item.text).join(' ').trim(),
        row: rowIdx,
        col: colIdx
      })
    }

    cells.push(rowCells)
  }

  if (cells.length > 0) {
    tables.push({
      cells,
      startY: potentialTableRows[0].y,
      endY: potentialTableRows[potentialTableRows.length - 1].y
    })
  }

  return tables
}

function clusterPositions(positions: number[], threshold: number): number[] {
  if (positions.length === 0) return []

  const sorted = [...positions].sort((a, b) => a - b)
  const clusters: number[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const lastCluster = clusters[clusters.length - 1]
    if (sorted[i] - lastCluster > threshold) {
      clusters.push(sorted[i])
    }
  }

  return clusters
}

function groupTextByRows(textItems: TextItem[]): string[][] {
  if (textItems.length === 0) return []

  const rowGroups: Map<number, TextItem[]> = new Map()
  const yThreshold = 5

  for (const item of textItems) {
    const normalizedY = Math.round(item.y / yThreshold) * yThreshold
    if (!rowGroups.has(normalizedY)) {
      rowGroups.set(normalizedY, [])
    }
    rowGroups.get(normalizedY)!.push(item)
  }

  const sortedYs = Array.from(rowGroups.keys()).sort((a, b) => b - a)

  return sortedYs.map((y) => {
    const items = rowGroups.get(y)!.sort((a, b) => a.x - b.x)
    return items.map((item) => item.text)
  })
}
