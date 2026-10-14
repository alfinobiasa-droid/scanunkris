'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { insertScanData } from '@/lib/supabase-service'
import OCRResult from './OCRResult'
import { ExtractedFields } from '@/lib/types'

export default function Scanner() {
  const [cameraAvailable, setCameraAvailable] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [showOCRResult, setShowOCRResult] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { currentSession, setIsLoading, setError, addScanToHistory } = useAppStore()

  // Check camera availability
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasCamera = devices.some((device) => device.kind === 'videoinput')
        setCameraAvailable(hasCamera)
      } catch (err) {
        console.error('Error checking camera:', err)
        setCameraAvailable(false)
      }
    }

    checkCamera()
  }, [])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
        setError(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengakses kamera'
      setError(`Kamera: ${message}`)
      console.error('Camera error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.95)
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCapturedImage(result)
        setError(null)
      }
      reader.onerror = () => {
        setError('Gagal membaca file')
      }
      reader.readAsDataURL(file)
    }
  }

  const clearCapture = () => {
    setCapturedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const proceedToOCR = () => {
    setShowOCRResult(true)
  }

  const handleOCRComplete = async (fields: ExtractedFields, rawText: string) => {
    if (!currentSession?.id) {
      setError('Sesi pairing tidak ditemukan')
      return
    }

    try {
      setIsLoading(true)

      // Insert scan data to Supabase
      const scanData = await insertScanData(currentSession.id, {
        letter_type: fields.letterType.value,
        letter_number: fields.letterNumber.value,
        subject: fields.subject.value,
        sender: fields.sender.value,
        recipient: fields.recipient.value,
        letter_date: fields.letterDate.value,
        received_date: fields.receivedDate.value,
        description: fields.description.value,
        has_agenda: fields.hasAgenda.value,
        agenda_start: fields.agendaStart.value,
        agenda_end: fields.agendaEnd.value,
        agenda_location: fields.agendaLocation.value,
        ocr_raw_text: rawText,
        ocr_confidence:
          Object.values(fields).reduce((sum, f) => sum + (f.confidence || 0), 0) /
          Object.keys(fields).length,
        status: 'completed',
      })

      // Add to history
      addScanToHistory(scanData)

      // Reset UI
      setShowOCRResult(false)
      setCapturedImage(null)
      setError(null)

      console.log('Scan data submitted:', scanData.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan data surat'
      setError(message)
      console.error('Error saving scan:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Show OCR result if processing
  if (showOCRResult && capturedImage) {
    return (
      <OCRResult
        imageData={capturedImage}
        onComplete={handleOCRComplete}
        onCancel={() => {
          setShowOCRResult(false)
          setCapturedImage(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Camera/Upload Section */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {capturedImage ? (
          // Preview captured image
          <div className="space-y-4 p-4">
            <div className="bg-slate-100 rounded-lg overflow-hidden">
              <img src={capturedImage} alt="Foto surat" className="w-full h-auto" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearCapture}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition"
              >
                Batal
              </button>
              <button
                onClick={proceedToOCR}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Baca Surat
              </button>
            </div>
          </div>
        ) : isCameraActive ? (
          // Camera active
          <div className="space-y-4 p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black" />
            <div className="flex gap-2">
              <button
                onClick={stopCamera}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition"
              >
                Tutup Kamera
              </button>
              <button
                onClick={capturePhoto}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Ambil Foto
              </button>
            </div>
          </div>
        ) : (
          // No camera active
          <div className="p-6 space-y-4">
            {cameraAvailable ? (
              <>
                <p className="text-slate-700 text-center">
                  Buka kamera untuk memotret surat
                </p>
                <button
                  onClick={startCamera}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Buka Kamera
                </button>
              </>
            ) : (
              <p className="text-slate-600 text-center text-sm">
                Kamera tidak tersedia
              </p>
            )}
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <p className="text-slate-600 text-sm mb-3">atau pilih foto dari galeri:</p>
        <label className="block">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="block w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-center cursor-pointer hover:bg-slate-200 transition">
            Pilih Foto
          </span>
        </label>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
