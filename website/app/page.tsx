'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Scanner from '@/components/Scanner'
import Status from '@/components/Status'
import SessionHistory from '@/components/SessionHistory'
import Pairing from '@/components/Pairing'
import { subscribePairingSession, unsubscribeAll } from '@/lib/supabase-service'

export default function Home() {
  const { currentSession, connectionStatus, error } = useAppStore()

  useEffect(() => {
    // Subscribe to pairing session changes if session exists
    if (currentSession?.id) {
      subscribePairingSession(currentSession.id, (payload) => {
        console.log('Pairing session updated:', payload)
      })

      return () => {
        unsubscribeAll()
      }
    }
    return undefined
  }, [currentSession?.id])

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">ScanSurat UNKRIS</h1>
        <p className="text-slate-600 text-sm mt-1">
          Aplikasi pemindai surat untuk portal UNKRIS
        </p>
      </div>

      {/* Connection Status */}
      <Status status={connectionStatus} />

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* No Session State */}
      {!currentSession ? (
        <Pairing />
      ) : (
        <>
          {/* Scanner Component */}
          <Scanner />

          {/* Session History */}
          <SessionHistory />
        </>
      )}
    </main>
  )
}
