'use client'

import { ConnectionStatus } from '@/lib/types'

interface StatusProps {
  status: ConnectionStatus
}

export default function Status({ status }: StatusProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {/* Session ID */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <p className="text-xs text-slate-600 font-medium mb-1">SESI</p>
        {status.sessionId ? (
          <p className="font-mono text-sm text-slate-900 truncate">
            {status.sessionId.substring(0, 8)}...
          </p>
        ) : (
          <p className="text-sm text-slate-400">Belum terhubung</p>
        )}
      </div>

      {/* Mobile Connection */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <p className="text-xs text-slate-600 font-medium mb-1">HP</p>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status.mobileConnected ? 'bg-green-500' : 'bg-slate-300'
            }`}
          />
          <span className="text-sm text-slate-900 font-medium">
            {status.mobileConnected ? 'Terhubung' : 'Offline'}
          </span>
        </div>
      </div>

      {/* PC Connection */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <p className="text-xs text-slate-600 font-medium mb-1">PC</p>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status.pcConnected ? 'bg-green-500' : 'bg-slate-300'
            }`}
          />
          <span className="text-sm text-slate-900 font-medium">
            {status.pcConnected ? 'Terhubung' : 'Offline'}
          </span>
        </div>
      </div>

      {/* PC Bridge */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <p className="text-xs text-slate-600 font-medium mb-1">BRIDGE</p>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status.pcBridgeReachable ? 'bg-green-500' : 'bg-slate-300'
            }`}
          />
          <span className="text-sm text-slate-900 font-medium">
            {status.pcBridgeReachable ? 'Ready' : 'Down'}
          </span>
        </div>
      </div>
    </div>
  )
}
