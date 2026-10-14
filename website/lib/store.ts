import { create } from 'zustand'
import { ConnectionStatus, ScanData, PairingSession } from './types'

interface AppState {
  // Connection state
  connectionStatus: ConnectionStatus
  setConnectionStatus: (status: ConnectionStatus) => void

  // Pairing state
  currentSession: PairingSession | null
  setCurrentSession: (session: PairingSession | null) => void

  // Scan history
  scanHistory: ScanData[]
  addScanToHistory: (scan: ScanData) => void
  clearScanHistory: () => void

  // UI state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  connectionStatus: {
    sessionId: null,
    mobileConnected: false,
    pcConnected: false,
    pcBridgeReachable: false,
  },
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  currentSession: null,
  setCurrentSession: (session) => set({ currentSession: session }),

  scanHistory: [],
  addScanToHistory: (scan) =>
    set((state) => ({
      scanHistory: [scan, ...state.scanHistory].slice(0, 20), // Keep last 20
    })),
  clearScanHistory: () => set({ scanHistory: [] }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),
}))
