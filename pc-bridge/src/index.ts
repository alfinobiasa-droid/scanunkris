import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { supabaseAdmin } from './supabase'

config()

const app = express()
const port = parseInt(process.env.BRIDGE_PORT || '3001', 10)
const host = process.env.BRIDGE_HOST || 'localhost'

// Middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'chrome-extension://*'],
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))

// Session store
interface SessionData {
  sessionId: string
  extensionConnected: boolean
  lastHeartbeat: Date
  lastScanData?: any
  lastFormResult?: any
}

const sessions = new Map<string, SessionData>()

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    supabaseConnected: !!process.env.SUPABASE_URL,
  })
})

/**
 * Get bridge status
 */
app.get('/api/status', (req, res) => {
  res.json({
    bridgeRunning: true,
    extensionConnected: sessions.size > 0,
    lastActivityTime: new Date().toISOString(),
    activeSessionCount: sessions.size,
  })
})

/**
 * Extension registers with PC Bridge
 * Called when extension connects
 */
app.post('/api/extension/register', (req, res) => {
  const { sessionId, pairingSessionId } = req.body

  if (!sessionId || !pairingSessionId) {
    return res.status(400).json({ error: 'sessionId and pairingSessionId are required' })
  }

  const session: SessionData = {
    sessionId,
    extensionConnected: true,
    lastHeartbeat: new Date(),
  }

  sessions.set(sessionId, session)

  res.json({
    success: true,
    message: 'Extension registered',
    sessionId,
  })
})

/**
 * Extension heartbeat
 */
app.post('/api/extension/heartbeat', (req, res) => {
  const { sessionId } = req.body

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' })
  }

  const session = sessions.get(sessionId)
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  session.lastHeartbeat = new Date()
  sessions.set(sessionId, session)

  res.json({
    success: true,
    connected: true,
    timestamp: new Date().toISOString(),
  })
})

/**
 * Website submits scan data
 * PC Bridge receives from Supabase realtime and stores temporarily
 */
app.post('/api/scan/submit', async (req, res) => {
  const { sessionId, scanData } = req.body

  if (!sessionId || !scanData) {
    return res.status(400).json({ error: 'sessionId and scanData are required' })
  }

  const session = sessions.get(sessionId)
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  if (!session.extensionConnected) {
    return res.status(503).json({ error: 'Extension not connected' })
  }

  // Store scan data for extension to retrieve
  session.lastScanData = scanData
  sessions.set(sessionId, session)

  // Log to Supabase for audit trail (optional)
  try {
    await supabaseAdmin.from('scan_data').update({ status: 'completed' }).eq('id', scanData.id)
  } catch (err) {
    console.error('Failed to update scan data status:', err)
  }

  res.json({
    success: true,
    message: 'Scan data received',
    sessionId,
  })
})

/**
 * Extension retrieves pending scan data
 */
app.get('/api/scan/pending', (req, res) => {
  const { sessionId } = req.query

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' })
  }

  const session = sessions.get(sessionId as string)
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  if (session.lastScanData) {
    const scanData = session.lastScanData
    // Clear after retrieval (can be called multiple times, but data only retrieved once)
    session.lastScanData = null
    sessions.set(sessionId as string, session)

    return res.json({
      hasPendingData: true,
      scanData,
    })
  }

  res.json({ hasPendingData: false })
})

/**
 * Extension notifies form fill result
 */
app.post('/api/form/result', async (req, res) => {
  const { sessionId, result, scanDataId } = req.body

  if (!sessionId || !result) {
    return res.status(400).json({ error: 'sessionId and result are required' })
  }

  const session = sessions.get(sessionId)
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  // Store result temporarily
  session.lastFormResult = result
  sessions.set(sessionId, session)

  // Log to Supabase
  try {
    await supabaseAdmin.from('form_fill_results').insert({
      scan_data_id: scanDataId,
      filled_fields: result.filledFields || [],
      failed_fields: result.failedFields || [],
      success: result.success === true,
      message: result.message,
    })
  } catch (err) {
    console.error('Failed to log form result:', err)
  }

  res.json({
    success: true,
    message: 'Form fill result received',
  })
})

/**
 * Extension disconnects
 */
app.post('/api/extension/disconnect', (req, res) => {
  const { sessionId } = req.body

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' })
  }

  sessions.delete(sessionId)

  res.json({
    success: true,
    message: 'Extension disconnected',
  })
})

/**
 * Error handling
 */
app.use(
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
  },
)

// Start server
app.listen(port, host, () => {
  console.log(`✓ PC Bridge running at http://${host}:${port}`)
  console.log(`✓ Environment: ${process.env.NODE_ENV}`)
  if (process.env.SUPABASE_URL) {
    console.log(`✓ Supabase connected`)
  }
})
