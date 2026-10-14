// Types for PC Bridge

export interface BridgeSession {
  sessionId: string
  extensionConnected: boolean
  lastHeartbeat: Date
  confirmationToken: string | null
}

export interface ScanDataMessage {
  scanDataId: string
  letterType: string
  letterNumber: string
  subject: string
  sender: string
  recipient: string
  letterDate: string | null
  receivedDate: string | null
  description: string
  hasAgenda: boolean
  agendaStart: string | null
  agendaEnd: string | null
  agendaLocation: string
}

export interface BridgeStatus {
  bridgeRunning: boolean
  extensionConnected: boolean
  lastActivityTime: string
  activeSessionCount: number
}
