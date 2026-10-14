'use client'

import { useAppStore } from '@/lib/store'

export default function SessionHistory() {
  const { scanHistory, clearScanHistory } = useAppStore()

  if (scanHistory.length === 0) {
    return null
  }

  return (
    <div className="mt-8 bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Riwayat Sesi</h2>
        <button
          onClick={clearScanHistory}
          className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition"
        >
          Hapus Semua
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {scanHistory.map((scan) => (
          <div key={scan.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {scan.subject || 'Surat tanpa subjek'}
              </p>
              <p className="text-xs text-slate-600">
                {new Date(scan.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
            <div className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              scan.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : scan.status === 'processing'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {scan.status === 'completed'
                ? 'Selesai'
                : scan.status === 'processing'
                ? 'Proses'
                : 'Gagal'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
