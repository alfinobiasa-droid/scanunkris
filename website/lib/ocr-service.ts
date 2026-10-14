/**
 * OCR Service - Tesseract.js integration
 * Processes images and extracts text
 */

import Tesseract from 'tesseract.js'
import { ExtractedFields } from './types'

export class OCRService {
  private worker: Tesseract.Worker | null = null
  private isInitialized = false

  /**
   * Initialize Tesseract worker
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      this.worker = await Tesseract.createWorker('ind') // Indonesian language
      this.isInitialized = true
      console.log('Tesseract worker initialized')
    } catch (err) {
      console.error('Failed to initialize Tesseract:', err)
      throw new Error('Gagal menginisialisasi OCR')
    }
  }

  /**
   * Process image and extract text
   */
  async recognizeText(imageData: string): Promise<{ text: string; confidence: number }> {
    if (!this.worker) {
      throw new Error('OCR service not initialized')
    }

    try {
      const result = await this.worker.recognize(imageData)
      return {
        text: result.data.text,
        confidence: result.data.confidence,
      }
    } catch (err) {
      console.error('OCR recognition failed:', err)
      throw new Error('Gagal membaca teks dari gambar')
    }
  }

  /**
   * Terminate worker and cleanup
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
      this.isInitialized = false
    }
  }
}

// Singleton instance
let ocrService: OCRService | null = null

export async function getOCRService() {
  if (!ocrService) {
    ocrService = new OCRService()
    await ocrService.initialize()
  }
  return ocrService
}

/**
 * Extract structured fields from OCR text
 */
export function extractFieldsFromText(text: string): ExtractedFields {
  const lines = text.split('\n').filter((line) => line.trim())
  const fullText = text.toLowerCase()

  // Letter type detection
  const letterTypeMatch = detectLetterType(fullText)

  // Letter number - typically in format: XXX/UNKRIS/YYYY
  const numberMatch = text.match(/(\d+\/[A-Za-z\/\-\.]+\d{4})/i)

  // Subject - usually after "PERIHAL" or similar
  const subjectMatch = text.match(/(?:perihal|hal|subject|re)[:\s]+([^\n]+)/i)

  // Date extraction - look for date patterns
  const dates = extractDates(text)

  // Sender/Recipient - look for "Dari", "Kepada", "From", "To"
  const senderMatch = text.match(/(?:dari|pengirim|from)[:\s]+([^\n]+)/i)
  const recipientMatch = text.match(/(?:kepada|penerima|to)[:\s]+([^\n]+)/i)

  // Agenda detection
  const hasAgenda = /agenda|jadwal|schedule|rapat|meeting/i.test(fullText)

  // Agenda times - look for time patterns
  const agendaTimes = extractAgendaTimes(text)

  // Agenda location
  const locationMatch = text.match(/(?:lokasi|tempat|lokasi|place)[:\s]+([^\n]+)/i)

  return {
    letterType: {
      value: letterTypeMatch,
      confidence: letterTypeMatch ? 0.8 : 0,
      requiresVerification: !letterTypeMatch,
    },
    letterNumber: {
      value: numberMatch?.[1] || '',
      confidence: numberMatch ? 0.9 : 0,
      requiresVerification: !numberMatch,
    },
    subject: {
      value: subjectMatch?.[1]?.trim() || '',
      confidence: subjectMatch ? 0.85 : 0,
      requiresVerification: !subjectMatch,
    },
    sender: {
      value: senderMatch?.[1]?.trim() || '',
      confidence: senderMatch ? 0.7 : 0,
      requiresVerification: !senderMatch,
    },
    recipient: {
      value: recipientMatch?.[1]?.trim() || '',
      confidence: recipientMatch ? 0.7 : 0,
      requiresVerification: !recipientMatch,
    },
    letterDate: {
      value: dates.letterDate,
      confidence: dates.letterDate ? 0.85 : 0,
      requiresVerification: !dates.letterDate,
    },
    receivedDate: {
      value: dates.receivedDate,
      confidence: dates.receivedDate ? 0.8 : 0,
      requiresVerification: !dates.receivedDate,
    },
    description: {
      value: '',
      confidence: 0,
      requiresVerification: true,
    },
    hasAgenda: {
      value: hasAgenda,
      confidence: hasAgenda ? 0.6 : 0.9,
      requiresVerification: false,
    },
    agendaStart: {
      value: agendaTimes.start,
      confidence: agendaTimes.start ? 0.7 : 0,
      requiresVerification: !agendaTimes.start,
    },
    agendaEnd: {
      value: agendaTimes.end,
      confidence: agendaTimes.end ? 0.7 : 0,
      requiresVerification: !agendaTimes.end,
    },
    agendaLocation: {
      value: locationMatch?.[1]?.trim() || '',
      confidence: locationMatch ? 0.75 : 0,
      requiresVerification: !locationMatch,
    },
  }
}

/**
 * Detect letter type from text
 */
function detectLetterType(text: string): string {
  const types = {
    undangan: /undangan|invitation|invite/i,
    surat_tugas: /surat tugas|task letter|assignment/i,
    surat_keputusan: /surat keputusan|keputusan|decision|decree/i,
    pengumuman: /pengumuman|announcement|pemberitahuan/i,
    surat_keluar: /surat keluar|outgoing|keluar/i,
    surat_masuk: /surat masuk|incoming|masuk/i,
  }

  for (const [type, pattern] of Object.entries(types)) {
    if (pattern.test(text)) {
      return type
    }
  }

  return ''
}

/**
 * Extract date patterns from text
 */
function extractDates(
  text: string,
): { letterDate: string | null; receivedDate: string | null } {
  const datePattern =
    /(\d{1,2})\s*(?:januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des|\/-|\.|\-)\s*(\d{1,2})?\s*(\d{4})/gi

  const matches = [...text.matchAll(datePattern)]

  if (matches.length === 0) {
    // Try ISO format
    const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) {
      return {
        letterDate: isoMatch[0],
        receivedDate: null,
      }
    }
    return { letterDate: null, receivedDate: null }
  }

  const dates = matches.map((m) => parseIndonesianDate(text, m.index || 0))

  return {
    letterDate: dates[0] || null,
    receivedDate: dates[1] || null,
  }
}

/**
 * Parse Indonesian date format
 */
function parseIndonesianDate(text: string, index: number): string | null {
  const dateStr = text.substring(index, index + 20)

  const months: { [key: string]: string } = {
    januari: '01',
    februari: '02',
    maret: '03',
    april: '04',
    mei: '05',
    juni: '06',
    juli: '07',
    agustus: '08',
    september: '09',
    oktober: '10',
    november: '11',
    desember: '12',
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    jun: '06',
    jul: '07',
    agu: '08',
    sep: '09',
    okt: '10',
    nov: '11',
    des: '12',
  }

  const match = dateStr.match(/(\d{1,2})[^\d]+([a-z]+)[^\d]+(\d{4})/i)
  if (!match) return null

  const day = match[1].padStart(2, '0')
  const month = months[match[2].toLowerCase()] || ''
  const year = match[3]

  if (!month) return null

  return `${year}-${month}-${day}`
}

/**
 * Extract agenda times from text
 */
function extractAgendaTimes(text: string): { start: string | null; end: string | null } {
  // Look for time patterns HH:MM
  const timePattern = /(\d{1,2}):(\d{2})/g

  const times = [...text.matchAll(timePattern)]

  if (times.length === 0) {
    return { start: null, end: null }
  }

  // Format as ISO time (assumes today's date for now)
  const today = new Date().toISOString().split('T')[0]
  const startTime = times[0]
    ? `${today}T${times[0][1].padStart(2, '0')}:${times[0][2]}`
    : null
  const endTime = times[1]
    ? `${today}T${times[1][1].padStart(2, '0')}:${times[1][2]}`
    : null

  return { start: startTime, end: endTime }
}
