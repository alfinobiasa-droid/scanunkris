'use client'

import { useState, useRef, useEffect } from 'react'
import { ExtractedFields } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { getOCRService } from '@/lib/ocr-service'

interface OCRResultProps {
  imageData: string
  onComplete: (fields: ExtractedFields, rawText: string) => void
  onCancel: () => void
}

export default function OCRResult({ imageData, onComplete, onCancel }: OCRResultProps) {
  const [fields, setFields] = useState<ExtractedFields | null>(null)
  const [rawText, setRawText] = useState('')
  const [isProcessing, setIsProcessing] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const processingRef = useRef(false)
  const { setIsLoading, setError } = useAppStore()

  // Process OCR on mount
  useEffect(() => {
    if (processingRef.current) return
    processingRef.current = true

    const processImage = async () => {
      try {
        setIsLoading(true)

        // Dynamic import to avoid SSR issues
        const { getOCRService, extractFieldsFromText } = await import('@/lib/ocr-service')

        const ocr = await getOCRService()
        const result = await ocr.recognizeText(imageData)

        setRawText(result.text)

        // Extract fields
        const { extractFieldsFromText } = await import('@/lib/ocr-service')
        const extracted = extractFieldsFromText(result.text)
        setFields(extracted)

        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memproses gambar'
        setError(message)
        console.error('OCR error:', err)
      } finally {
        setIsProcessing(false)
        setIsLoading(false)
      }
    }

    processImage()
  }, [imageData, setIsLoading, setError])

  if (isProcessing) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            </div>
            <p className="text-slate-600 font-medium">Membaca surat...</p>
            <p className="text-slate-500 text-sm mt-1">Ini membutuhkan waktu 10-30 detik</p>
          </div>
        </div>
      </div>
    )
  }

  if (!fields) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">Gagal membaca gambar. Silakan coba foto lagi.</p>
        </div>
        <button
          onClick={onCancel}
          className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition"
        >
          Batal
        </button>
      </div>
    )
  }

  const handleFieldChange = (key: keyof ExtractedFields, value: any) => {
    setFields({
      ...fields,
      [key]: {
        ...fields[key],
        value: value,
      },
    })
  }

  const handleSubmit = () => {
    onComplete(fields, rawText)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Hasil Pembacaan Surat</h2>
        <p className="text-sm text-slate-600">
          Periksa dan perbaiki data sebelum mengirim. Field berwarna merah perlu verifikasi.
        </p>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
        {/* Jenis Surat */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Jenis Surat
            {fields.letterType.requiresVerification && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <select
            value={fields.letterType.value || ''}
            onChange={(e) => handleFieldChange('letterType', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
              fields.letterType.requiresVerification
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
          >
            <option value="">-- Pilih Jenis Surat --</option>
            <option value="undangan">Undangan</option>
            <option value="surat_tugas">Surat Tugas</option>
            <option value="surat_keputusan">Surat Keputusan</option>
            <option value="pengumuman">Pengumuman</option>
            <option value="surat_keluar">Surat Keluar</option>
            <option value="surat_masuk">Surat Masuk</option>
            <option value="lainnya">Lainnya</option>
          </select>
          {fields.letterType.confidence > 0 && (
            <p className="text-xs text-slate-600 mt-1">
              Kepercayaan: {Math.round(fields.letterType.confidence * 100)}%
            </p>
          )}
        </div>

        {/* Nomor Surat */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nomor Surat
            {fields.letterNumber.requiresVerification && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type="text"
            value={fields.letterNumber.value || ''}
            onChange={(e) => handleFieldChange('letterNumber', e.target.value)}
            placeholder="Contoh: 001/UNKRIS/2026"
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
              fields.letterNumber.requiresVerification
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
          />
          {fields.letterNumber.confidence > 0 && (
            <p className="text-xs text-slate-600 mt-1">
              Kepercayaan: {Math.round(fields.letterNumber.confidence * 100)}%
            </p>
          )}
        </div>

        {/* Perihal */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Perihal
            {fields.subject.requiresVerification && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            value={fields.subject.value || ''}
            onChange={(e) => handleFieldChange('subject', e.target.value)}
            placeholder="Masukkan perihal surat"
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
              fields.subject.requiresVerification
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
          />
          {fields.subject.confidence > 0 && (
            <p className="text-xs text-slate-600 mt-1">
              Kepercayaan: {Math.round(fields.subject.confidence * 100)}%
            </p>
          )}
        </div>

        {/* Pengirim */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Pengirim
            {fields.sender.requiresVerification && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            value={fields.sender.value || ''}
            onChange={(e) => handleFieldChange('sender', e.target.value)}
            placeholder="Masukkan nama pengirim"
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
              fields.sender.requiresVerification
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Penerima */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Penerima
            {fields.recipient.requiresVerification && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type="text"
            value={fields.recipient.value || ''}
            onChange={(e) => handleFieldChange('recipient', e.target.value)}
            placeholder="Masukkan nama penerima"
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
              fields.recipient.requiresVerification
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Tanggal Surat */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tanggal Surat
            {fields.letterDate.requiresVerification && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type="date"
            value={fields.letterDate.value || ''}
            onChange={(e) => handleFieldChange('letterDate', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
              fields.letterDate.requiresVerification
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Tanggal Diterima */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tanggal Diterima
            {fields.receivedDate.requiresVerification && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type="date"
            value={fields.receivedDate.value || ''}
            onChange={(e) => handleFieldChange('receivedDate', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
              fields.receivedDate.requiresVerification
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Has Agenda */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fields.hasAgenda.value}
              onChange={(e) => handleFieldChange('hasAgenda', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">Surat memiliki agenda</span>
          </label>
        </div>

        {/* Agenda Fields */}
        {fields.hasAgenda.value && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tanggal & Waktu Mulai Agenda
              </label>
              <input
                type="datetime-local"
                value={fields.agendaStart.value || ''}
                onChange={(e) => handleFieldChange('agendaStart', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tanggal & Waktu Selesai Agenda
              </label>
              <input
                type="datetime-local"
                value={fields.agendaEnd.value || ''}
                onChange={(e) => handleFieldChange('agendaEnd', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lokasi Agenda
              </label>
              <input
                type="text"
                value={fields.agendaLocation.value || ''}
                onChange={(e) => handleFieldChange('agendaLocation', e.target.value)}
                placeholder="Masukkan lokasi agenda"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
          <textarea
            value={fields.description.value || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Masukkan deskripsi atau ringkasan surat"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Raw Text Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center justify-between w-full mb-2"
        >
          <h3 className="text-sm font-semibold text-slate-900">Teks OCR Asli</h3>
          <span className="text-xs text-slate-500">{editMode ? '▼' : '▶'}</span>
        </button>

        {editMode && (
          <textarea
            value={rawText}
            readOnly
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 font-mono text-sm focus:outline-none"
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Kirim ke PC
        </button>
      </div>
    </div>
  )
}
