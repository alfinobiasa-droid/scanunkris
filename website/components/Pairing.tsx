'use client'

import { useState, useRef } from 'react'
import QRCode from 'qrcode.react'
import { useAppStore } from '@/lib/store'
import { createPairingSession, verifyPairingCode, updatePairingMobileConnected } from '@/lib/supabase-service'

export default function Pairing() {
  const [step, setStep] = useState<'initial' | 'qr' | 'verify' | 'confirmed'>('initial')
  const [pairingSession, setPairingSession] = useState<any>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const { setCurrentSession, setError, setConnectionStatus } = useAppStore()

  /**
   * Start pairing process
   */
  const startPairing = async () => {
    try {
      setIsLoading(true)
      const session = await createPairingSession()
      setPairingSession(session)
      setStep('qr')
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat sesi pairing'
      setError(message)
      console.error('Pairing error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Verify pairing code entered from mobile
   */
  const verifyCode = async () => {
    if (!verificationCode || !pairingSession) return

    try {
      setIsLoading(true)

      // Verify the code
      const verified = await verifyPairingCode(
        pairingSession.qr_token,
        verificationCode,
      )

      // Generate mobile session ID
      const mobileSessionId = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Update session with mobile connection
      await updatePairingMobileConnected(pairingSession.id, mobileSessionId)

      // Update UI state
      const updatedSession = {
        ...pairingSession,
        mobile_connected: true,
        mobile_session_id: mobileSessionId,
        status: 'paired',
      }

      setPairingSession(updatedSession)
      setCurrentSession(updatedSession)
      setConnectionStatus({
        sessionId: updatedSession.id,
        mobileConnected: true,
        pcConnected: false,
        pcBridgeReachable: false,
      })
      setStep('confirmed')
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kode pairing tidak valid'
      setError(message)
      console.error('Verification error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Cancel pairing
   */
  const cancelPairing = () => {
    setStep('initial')
    setPairingSession(null)
    setVerificationCode('')
  }

  /**
   * Download QR code
   */
  const downloadQR = () => {
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current.querySelector('canvas')
      if (canvas) {
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `scansurat-qr-${pairingSession.pairing_code}.png`
        link.click()
      }
    }
  }

  // Render based on step
  if (step === 'initial') {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-slate-700 mb-4">
            Mulai pairing dengan memindai QR Code menggunakan HP
          </p>
          <button
            onClick={startPairing}
            disabled={isLoading}
            className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Membuat QR...' : 'Mulai Pairing'}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'qr') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">
            Pindai dengan HP
          </h2>

          {/* QR Code */}
          <div ref={qrCodeRef} className="bg-slate-100 rounded-lg p-6 mb-4 flex justify-center">
            <QRCode
              value={`${window.location.origin}?pairing=${pairingSession.qr_token}`}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Pairing Code */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4 text-center">
            <p className="text-sm text-slate-600 mb-1">Atau masukkan kode ini di HP:</p>
            <p className="text-3xl font-bold text-primary font-mono tracking-widest">
              {pairingSession.pairing_code}
            </p>
          </div>

          {/* Download button */}
          <button
            onClick={downloadQR}
            className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition mb-4"
          >
            Download QR Code
          </button>

          {/* Verification Code Input */}
          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600 mb-3">
              Setelah HP menunjukkan kode 6 digit, masukkan di sini:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-mono text-lg tracking-widest text-center focus:outline-none focus:border-primary"
              />
              <button
                onClick={verifyCode}
                disabled={verificationCode.length !== 6 || isLoading}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? '...' : 'Verifikasi'}
              </button>
            </div>
          </div>

          {/* Cancel button */}
          <button
            onClick={cancelPairing}
            className="w-full mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
          >
            Batal
          </button>
        </div>
      </div>
    )
  }

  if (step === 'confirmed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h2 className="text-lg font-semibold text-green-900 mb-2">Pairing Berhasil!</h2>
        <p className="text-green-700 text-sm mb-4">
          HP dan PC sekarang terhubung. Silakan ambil foto surat.
        </p>
        <p className="text-xs text-green-600 font-mono">
          Sesi ID: {pairingSession.id.substring(0, 8)}...
        </p>
      </div>
    )
  }

  return null
}
