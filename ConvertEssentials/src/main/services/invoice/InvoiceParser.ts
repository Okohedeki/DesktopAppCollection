import * as fs from 'fs'
import ExcelJS from 'exceljs'
import { readPdf, getOutputPath, TextItem } from '../pdf/PdfReader'
import { ConversionResult, ConversionProgress } from '../../../shared/types/Conversion'

type ProgressCallback = (progress: ConversionProgress) => void

interface InvoiceData {
  vendor: string
  invoiceNumber: string
  date: string
  dueDate: string
  subtotal: number
  tax: number
  total: number
  currency: string
  lineItems: LineItem[]
  confidence: number
}

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export async function parseInvoice(
  inputPath: string,
  outputDir: string | undefined,
  onProgress: ProgressCallback
): Promise<ConversionResult> {
  try {
    onProgress({
      status: 'processing',
      progress: 10,
      message: 'Reading invoice...'
    })

    const pdf = await readPdf(inputPath)

    onProgress({
      status: 'processing',
      progress: 30,
      message: 'Extracting invoice data...'
    })

    // Combine all text
    const fullText = pdf.pages.map((p) => p.fullText).join('\n')
    const allTextItems = pdf.pages.flatMap((p) => p.textItems)

    onProgress({
      status: 'processing',
      progress: 50,
      message: 'Parsing invoice fields...'
    })

    const invoiceData = extractInvoiceData(fullText, allTextItems)

    onProgress({
      status: 'processing',
      progress: 70,
      message: 'Creating Excel output...'
    })

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'ConvertEssentials'
    workbook.created = new Date()

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Invoice Summary')
    summarySheet.columns = [
      { header: 'Field', key: 'field', width: 20 },
      { header: 'Value', key: 'value', width: 40 }
    ]

    summarySheet.addRows([
      { field: 'Vendor', value: invoiceData.vendor },
      { field: 'Invoice Number', value: invoiceData.invoiceNumber },
      { field: 'Date', value: invoiceData.date },
      { field: 'Due Date', value: invoiceData.dueDate },
      { field: 'Subtotal', value: formatCurrency(invoiceData.subtotal, invoiceData.currency) },
      { field: 'Tax', value: formatCurrency(invoiceData.tax, invoiceData.currency) },
      { field: 'Total', value: formatCurrency(invoiceData.total, invoiceData.currency) },
      { field: 'Currency', value: invoiceData.currency },
      { field: 'Extraction Confidence', value: `${invoiceData.confidence.toFixed(0)}%` }
    ])

    // Style header row
    summarySheet.getRow(1).font = { bold: true }
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    // Line items sheet
    if (invoiceData.lineItems.length > 0) {
      const itemsSheet = workbook.addWorksheet('Line Items')
      itemsSheet.columns = [
        { header: 'Description', key: 'description', width: 50 },
        { header: 'Quantity', key: 'quantity', width: 12 },
        { header: 'Unit Price', key: 'unitPrice', width: 15 },
        { header: 'Total', key: 'total', width: 15 }
      ]

      for (const item of invoiceData.lineItems) {
        itemsSheet.addRow({
          description: item.description,
          quantity: item.quantity,
          unitPrice: formatCurrency(item.unitPrice, invoiceData.currency),
          total: formatCurrency(item.total, invoiceData.currency)
        })
      }

      // Style header row
      itemsSheet.getRow(1).font = { bold: true }
      itemsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
    }

    onProgress({
      status: 'processing',
      progress: 90,
      message: 'Saving Excel file...'
    })

    const outputPath = getOutputPath(inputPath, outputDir, 'invoice.xlsx')
    await workbook.xlsx.writeFile(outputPath)

    onProgress({
      status: 'completed',
      progress: 100,
      message: `Invoice parsed! Confidence: ${invoiceData.confidence.toFixed(0)}%`
    })

    return {
      success: true,
      outputPath
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse invoice'
    }
  }
}

function extractInvoiceData(text: string, textItems: TextItem[]): InvoiceData {
  let confidence = 0
  let fieldsFound = 0
  const totalFields = 7

  // Extract vendor (usually at the top)
  const vendor = extractVendor(text)
  if (vendor) fieldsFound++

  // Extract invoice number
  const invoiceNumber = extractInvoiceNumber(text)
  if (invoiceNumber) fieldsFound++

  // Extract dates
  const dates = extractDates(text)
  if (dates.date) fieldsFound++
  if (dates.dueDate) fieldsFound++

  // Extract amounts
  const amounts = extractAmounts(text)
  if (amounts.total > 0) fieldsFound++
  if (amounts.subtotal > 0) fieldsFound++
  if (amounts.tax > 0) fieldsFound++

  // Detect currency
  const currency = detectCurrency(text)

  // Extract line items
  const lineItems = extractLineItems(text, textItems)

  confidence = (fieldsFound / totalFields) * 100

  return {
    vendor,
    invoiceNumber,
    date: dates.date,
    dueDate: dates.dueDate,
    subtotal: amounts.subtotal,
    tax: amounts.tax,
    total: amounts.total,
    currency,
    lineItems,
    confidence
  }
}

function extractVendor(text: string): string {
  // Look for company-like names at the beginning
  const lines = text.split('\n').filter((l) => l.trim())

  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim()
    // Skip common non-vendor patterns
    if (
      trimmed.toLowerCase().includes('invoice') ||
      trimmed.toLowerCase().includes('receipt') ||
      trimmed.match(/^\d/) ||
      trimmed.length < 3
    ) {
      continue
    }

    // Likely vendor name
    if (trimmed.length > 2 && trimmed.length < 100) {
      return trimmed
    }
  }

  return 'Unknown Vendor'
}

function extractInvoiceNumber(text: string): string {
  const patterns = [
    /invoice\s*#?\s*:?\s*([A-Z0-9-]+)/i,
    /inv\s*#?\s*:?\s*([A-Z0-9-]+)/i,
    /receipt\s*#?\s*:?\s*([A-Z0-9-]+)/i,
    /order\s*#?\s*:?\s*([A-Z0-9-]+)/i,
    /#\s*([A-Z0-9-]+)/i
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return ''
}

function extractDates(text: string): { date: string; dueDate: string } {
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g,
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})/gi,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})/gi
  ]

  const dates: string[] = []

  for (const pattern of datePatterns) {
    const matches = text.match(pattern)
    if (matches) {
      dates.push(...matches)
    }
  }

  // Remove duplicates
  const uniqueDates = [...new Set(dates)]

  // Look for labeled dates
  const dueDateMatch = text.match(/due\s*(?:date)?[:\s]*([^\n]+)/i)
  const invoiceDateMatch = text.match(/(?:invoice|receipt)\s*date[:\s]*([^\n]+)/i)

  let date = ''
  let dueDate = ''

  if (invoiceDateMatch) {
    const dateInMatch = invoiceDateMatch[1].match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/)
    if (dateInMatch) date = dateInMatch[0]
  }

  if (dueDateMatch) {
    const dateInMatch = dueDateMatch[1].match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/)
    if (dateInMatch) dueDate = dateInMatch[0]
  }

  // Fallback to first/second found date
  if (!date && uniqueDates.length > 0) {
    date = uniqueDates[0]
  }
  if (!dueDate && uniqueDates.length > 1) {
    dueDate = uniqueDates[1]
  }

  return { date, dueDate }
}

function extractAmounts(text: string): { subtotal: number; tax: number; total: number } {
  const amountPattern = /[$€£¥]?\s*[\d,]+\.?\d*/g

  // Look for labeled amounts
  const totalMatch = text.match(/(?:total|grand\s*total|amount\s*due)[:\s]*[$€£¥]?\s*([\d,]+\.?\d*)/i)
  const subtotalMatch = text.match(/(?:subtotal|sub-total|sub\s*total)[:\s]*[$€£¥]?\s*([\d,]+\.?\d*)/i)
  const taxMatch = text.match(/(?:tax|vat|gst|hst)[:\s]*[$€£¥]?\s*([\d,]+\.?\d*)/i)

  const parseAmount = (str: string | undefined): number => {
    if (!str) return 0
    return parseFloat(str.replace(/,/g, '')) || 0
  }

  let total = parseAmount(totalMatch?.[1])
  let subtotal = parseAmount(subtotalMatch?.[1])
  let tax = parseAmount(taxMatch?.[1])

  // If no labeled total found, look for the largest number
  if (total === 0) {
    const allAmounts = text.match(amountPattern)
    if (allAmounts) {
      const numbers = allAmounts
        .map((a) => parseFloat(a.replace(/[$€£¥,\s]/g, '')))
        .filter((n) => !isNaN(n) && n > 0)
        .sort((a, b) => b - a)

      if (numbers.length > 0) {
        total = numbers[0]
      }
    }
  }

  return { subtotal, tax, total }
}

function detectCurrency(text: string): string {
  if (text.includes('$') || text.toLowerCase().includes('usd')) return 'USD'
  if (text.includes('€') || text.toLowerCase().includes('eur')) return 'EUR'
  if (text.includes('£') || text.toLowerCase().includes('gbp')) return 'GBP'
  if (text.includes('¥') || text.toLowerCase().includes('jpy')) return 'JPY'
  if (text.toLowerCase().includes('cad')) return 'CAD'
  return 'USD' // Default
}

function extractLineItems(text: string, textItems: TextItem[]): LineItem[] {
  const lineItems: LineItem[] = []

  // Simple heuristic: look for lines with description + numbers
  const lines = text.split('\n')

  for (const line of lines) {
    // Match pattern: text followed by quantity, price, total
    const match = line.match(/^(.+?)\s+(\d+)\s+[$€£¥]?([\d,]+\.?\d*)\s+[$€£¥]?([\d,]+\.?\d*)$/i)

    if (match) {
      lineItems.push({
        description: match[1].trim(),
        quantity: parseInt(match[2], 10),
        unitPrice: parseFloat(match[3].replace(/,/g, '')),
        total: parseFloat(match[4].replace(/,/g, ''))
      })
    }
  }

  return lineItems
}

function formatCurrency(amount: number, currency: string): string {
  if (amount === 0) return '-'

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$'
  }

  const symbol = symbols[currency] || '$'
  return `${symbol}${amount.toFixed(2)}`
}
