// Type definitions for ScanSurat UNKRIS

export interface PairingSession {
  id: string
  pairingCode: string
  qrToken: string
  status: 'pending' | 'paired' | 'expired'
  mobileConnected: boolean
  pcConnected: boolean
  createdAt: string
  expiresAt: string
}

export interface ScanData {
  id: string
  pairingSessionId: string
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
  ocrRawText: string
  ocrConfidence: number
  status: 'processing' | 'completed' | 'failed'
  createdAt: string
}

export interface ExtractedFields {
  letterType: {
    value: string
    confidence: number
    requiresVerification: boolean
  }
  letterNumber: {
    value: string
    confidence: number
    requiresVerification: boolean
  }
  subject: {
    value: string
    confidence: number
    requiresVerification: boolean
  }
  sender: {
    value: string
    confidence: number
    requiresVerification: boolean
  }
  recipient: {
    value: string
    confidence: number
    requiresVerification: boolean
  }
  letterDate: {
    value: string | null
    confidence: number
    requiresVerification: boolean
  }
  receivedDate: {
    value: string | null
    confidence: number
    requiresVerification: boolean
  }
  description: {
    value: string
    confidence: number
    requiresVerification: boolean
  }
  hasAgenda: {
    value: boolean
    confidence: number
    requiresVerification: boolean
  }
  agendaStart: {
    value: string | null
    confidence: number
    requiresVerification: boolean
  }
  agendaEnd: {
    value: string | null
    confidence: number
    requiresVerification: boolean
  }
  agendaLocation: {
    value: string
    confidence: number
    requiresVerification: boolean
  }
}

export interface ConnectionStatus {
  sessionId: string | null
  mobileConnected: boolean
  pcConnected: boolean
  pcBridgeReachable: boolean
}

export interface FormFillRequest {
  scanDataId: string
  action: 'fill-empty' | 'replace-all'
  confirmationToken: string
}

export interface FormFillResult {
  success: boolean
  filledFields: string[]
  failedFields: Array<{ field: string; reason: string }>
  message: string
}
