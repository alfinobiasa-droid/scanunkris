/**
 * Real-time relay service for PC Bridge
 * Bridges Supabase realtime channels with local PC Bridge
 */

import { supabase } from './supabase'

export class RealtimeRelay {
  private sessionId: string
  private subscriptions: Map<string, any> = new Map()

  constructor(sessionId: string) {
    this.sessionId = sessionId
  }

  /**
   * Subscribe to scan data updates
   */
  subscribeScanData(callback: (scan: any) => void) {
    const channel = supabase
      .channel(`scan:${this.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scan_data',
          filter: `pairing_session_id=eq.${this.sessionId}`,
        },
        (payload) => {
          console.log('New scan data:', payload)
          callback(payload.new)
        },
      )
      .subscribe()

    this.subscriptions.set('scan_data', channel)
  }

  /**
   * Subscribe to connection status updates
   */
  subscribeConnectionStatus(callback: (status: any) => void) {
    const channel = supabase
      .channel(`connection:${this.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'connection_status',
          filter: `pairing_session_id=eq.${this.sessionId}`,
        },
        (payload) => {
          console.log('Connection status updated:', payload)
          callback(payload.new)
        },
      )
      .subscribe()

    this.subscriptions.set('connection_status', channel)
  }

  /**
   * Subscribe to form fill results
   */
  subscribeFormResults(callback: (result: any) => void) {
    const channel = supabase
      .channel(`forms:${this.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'form_fill_results',
        },
        (payload) => {
          console.log('Form result:', payload)
          callback(payload.new)
        },
      )
      .subscribe()

    this.subscriptions.set('form_results', channel)
  }

  /**
   * Unsubscribe from all channels
   */
  async unsubscribeAll() {
    for (const [key, channel] of this.subscriptions.entries()) {
      await supabase.removeChannel(channel)
      this.subscriptions.delete(key)
    }
  }

  /**
   * Clean up
   */
  async cleanup() {
    await this.unsubscribeAll()
  }
}
