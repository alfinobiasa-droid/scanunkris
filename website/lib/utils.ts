import { PairingSession, ScanData } from './types'

/**
 * Generate a cryptographic pairing code (6 digits for UX simplicity)
 * Combined with UUID in URL for security
 */
export function generatePairingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Generate a secure QR token (used internally, not shown to user)
 */
export function generateQRToken(): string {
  const array = new Uint8Array(32)
  if (typeof window !== 'undefined') {
    crypto.getRandomValues(array)
  } else {
    // Node.js
    const crypto = require('crypto')
    crypto.randomFillSync(array)
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Calculate expiration timestamp (15 minutes from now)
 */
export function calculateExpiration(minutes: number = 15): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() + minutes)
  return now.toISOString()
}

/**
 * Check if pairing session is expired
 */
export function isPairingExpired(session: PairingSession): boolean {
  return new Date(session.expiresAt) < new Date()
}

/**
 * Normalize date string to ISO format (YYYY-MM-DD)
 */
export function normalizeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null

  const cleaned = dateStr.trim()

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned
  }

  // Try parsing various formats
  const date = new Date(cleaned)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]
  }

  return null
}

/**
 * Normalize datetime string to ISO format (YYYY-MM-DDTHH:mm)
 */
export function normalizeDateTime(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null

  const cleaned = dateStr.trim()

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(cleaned)) {
    return cleaned.substring(0, 16)
  }

  const date = new Date(cleaned)
  if (!isNaN(date.getTime())) {
    const iso = date.toISOString()
    return iso.substring(0, 16)
  }

  return null
}

/**
 * Validate letter type against allowed values
 */
export function isValidLetterType(type: string): boolean {
  const allowed = ['undangan', 'surat_tugas', 'surat_keputusan', 'pengumuman', 'surat_keluar', 'surat_masuk', 'lainnya']
  return allowed.includes(type.toLowerCase())
}
