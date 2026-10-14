/**
 * Supabase Service - Real-time channel and database operations
 */

import { supabase } from './supabase'
import { PairingSession, ScanData } from './types'
import { generatePairingCode, generateQRToken, calculateExpiration } from './utils'

/**
 * Create new pairing session
 */
export async function createPairingSession(): Promise<PairingSession> {
  const pairingCode = generatePairingCode()
  const qrToken = generateQRToken()
  const expiresAt = calculateExpiration(15) // 15 minutes

  const { data, error } = await supabase
    .from('pairing_sessions')
    .insert({
      pairing_code: pairingCode,
      qr_token: qrToken,
      status: 'pending',
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create pairing session: ${error.message}`)

  return data as PairingSession
}

/**
 * Verify pairing code (called by website to validate QR token)
 */
export async function verifyPairingCode(
  qrToken: string,
  pairingCode: string,
): Promise<PairingSession> {
  const { data, error } = await supabase
    .from('pairing_sessions')
    .select()
    .eq('qr_token', qrToken)
    .eq('pairing_code', pairingCode)
    .single()

  if (error) throw new Error('Invalid pairing code or token')

  const session = data as PairingSession

  // Check if expired
  if (new Date(session.expires_at) < new Date()) {
    throw new Error('Pairing token has expired')
  }

  // Check if already paired
  if (session.status === 'paired') {
    throw new Error('Session already paired')
  }

  return session
}

/**
 * Update pairing session with mobile connection
 */
export async function updatePairingMobileConnected(
  sessionId: string,
  mobileSessionId: string,
): Promise<void> {
  const { error } = await supabase
    .from('pairing_sessions')
    .update({
      mobile_connected: true,
      mobile_session_id: mobileSessionId,
      status: 'paired',
    })
    .eq('id', sessionId)

  if (error) throw new Error(`Failed to update pairing session: ${error.message}`)
}

/**
 * Update pairing session with PC connection
 */
export async function updatePairingPCConnected(
  sessionId: string,
  pcSessionId: string,
): Promise<void> {
  const { error } = await supabase
    .from('pairing_sessions')
    .update({
      pc_connected: true,
      pc_session_id: pcSessionId,
    })
    .eq('id', sessionId)

  if (error) throw new Error(`Failed to update pairing session: ${error.message}`)
}

/**
 * Get pairing session by ID
 */
export async function getPairingSession(sessionId: string): Promise<PairingSession> {
  const { data, error } = await supabase
    .from('pairing_sessions')
    .select()
    .eq('id', sessionId)
    .single()

  if (error) throw new Error('Pairing session not found')

  return data as PairingSession
}

/**
 * Insert scan data
 */
export async function insertScanData(
  sessionId: string,
  scanData: Partial<ScanData>,
): Promise<ScanData> {
  const { data, error } = await supabase
    .from('scan_data')
    .insert({
      pairing_session_id: sessionId,
      ...scanData,
      status: 'processing',
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to insert scan data: ${error.message}`)

  return data as ScanData
}

/**
 * Update scan data
 */
export async function updateScanData(
  scanDataId: string,
  updates: Partial<ScanData>,
): Promise<ScanData> {
  const { data, error } = await supabase
    .from('scan_data')
    .update(updates)
    .eq('id', scanDataId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update scan data: ${error.message}`)

  return data as ScanData
}

/**
 * Subscribe to scan data changes in real-time
 */
export function subscribeScanData(
  sessionId: string,
  callback: (payload: any) => void,
) {
  const subscription = supabase
    .channel(`scan_data:session:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'scan_data',
        filter: `pairing_session_id=eq.${sessionId}`,
      },
      callback,
    )
    .subscribe()

  return subscription
}

/**
 * Subscribe to pairing session changes
 */
export function subscribePairingSession(
  sessionId: string,
  callback: (payload: any) => void,
) {
  const subscription = supabase
    .channel(`pairing:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'pairing_sessions',
        filter: `id=eq.${sessionId}`,
      },
      callback,
    )
    .subscribe()

  return subscription
}

/**
 * Clean up subscriptions
 */
export async function unsubscribeAll() {
  await supabase.removeAllChannels()
}
