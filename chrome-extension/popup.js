// Updated popup.js for Stage 2 - Supabase integration

const BRIDGE_URL = 'http://localhost:3001'
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'

/**
 * Initialize Supabase client
 */
function getSupabaseClient() {
  return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/**
 * Handle connect button click
 */
async function handleConnect() {
  try {
    setIsLoading(true)

    // Check if bridge is reachable
    const healthRes = await fetch(`${BRIDGE_URL}/api/health`)
    if (!healthRes.ok) throw new Error('PC Bridge not reachable')

    // Generate session ID
    const sessionId = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Register with bridge
    const registerRes = await fetch(`${BRIDGE_URL}/api/extension/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        pairingSessionId: null, // Will be set after pairing
      }),
    })

    if (!registerRes.ok) throw new Error('Failed to register with bridge')

    // Store session
    chrome.storage.local.set({
      sessionId,
      bridgeUrl: BRIDGE_URL,
      connected: true,
      connectedAt: new Date().toISOString(),
    })

    showMessage('✓ Terhubung ke PC Bridge', 'info')
    updateUI()
    startHeartbeat()
    startPollingForScanData()
  } catch (error) {
    console.error('Connection error:', error)
    showMessage(
      '✗ Gagal terhubung ke PC Bridge. Pastikan PC Bridge berjalan di http://localhost:3001',
      'error',
    )
  } finally {
    setIsLoading(false)
  }
}

/**
 * Poll for scan data from PC Bridge
 */
function startPollingForScanData() {
  const storage = chrome.storage.local.get(['sessionId'], (result) => {
    const { sessionId } = result

    if (!sessionId) return

    // Poll every 2 seconds
    const pollInterval = setInterval(async () => {
      const storageCheck = await chrome.storage.local.get(['connected'])

      if (!storageCheck.connected) {
        clearInterval(pollInterval)
        return
      }

      try {
        const res = await fetch(`${BRIDGE_URL}/api/scan/pending?sessionId=${sessionId}`)
        const data = await res.json()

        if (data.hasPendingData && data.scanData) {
          // Store scan data
          chrome.storage.local.set({
            pendingScanData: data.scanData,
            lastDataReceivedAt: new Date().toISOString(),
          })

          // Notify popup
          chrome.runtime.sendMessage({
            action: 'UPDATE_UI',
          }).catch(() => {})

          // Show badge
          chrome.action.setBadgeText({ text: '!' })
          chrome.action.setBadgeBackgroundColor({ color: '#ef4444' })
        }
      } catch (error) {
        console.error('Poll error:', error)
      }
    }, 2000)
  })
}

/**
 * Handle disconnect
 */
async function handleDisconnect() {
  const storage = await chrome.storage.local.get(['sessionId', 'bridgeUrl'])
  const { sessionId, bridgeUrl } = storage

  if (sessionId && bridgeUrl) {
    try {
      await fetch(`${bridgeUrl}/api/extension/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  chrome.storage.local.clear()
  showMessage('✓ Koneksi terputus', 'info')
  updateUI()
}

/**
 * Handle fill form button click
 */
async function handleFillForm() {
  const storage = await chrome.storage.local.get(['sessionId', 'pendingScanData'])
  const { sessionId, pendingScanData } = storage

  if (!pendingScanData) {
    showMessage('Tidak ada data scan untuk diisi', 'warning')
    return
  }

  try {
    setIsLoading(true)

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id !== undefined) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: 'FILL_FORM',
            data: pendingScanData,
          },
          (response) => {
            if (response?.success) {
              showMessage('✓ Form berhasil diisi', 'info')

              // Send result to bridge
              fetch(`${BRIDGE_URL}/api/form/result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId,
                  scanDataId: pendingScanData.id,
                  result: response.result,
                }),
              }).catch(console.error)

              chrome.storage.local.remove('pendingScanData')
              updateUI()
            } else {
              showMessage(response?.message || 'Gagal mengisi form', 'error')
            }
            setIsLoading(false)
          },
        )
      }
    })
  } catch (error) {
    showMessage(
      error instanceof Error ? error.message : 'Gagal mengisi form',
      'error',
    )
    setIsLoading(false)
  }
}

/**
 * Start heartbeat
 */
function startHeartbeat() {
  chrome.storage.local.set({ heartbeatActive: true })

  const interval = setInterval(async () => {
    const storage = await chrome.storage.local.get(['sessionId', 'bridgeUrl', 'connected'])
    const { sessionId, bridgeUrl, connected } = storage

    if (!connected || !sessionId || !bridgeUrl) {
      clearInterval(interval)
      return
    }

    try {
      await fetch(`${bridgeUrl}/api/extension/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
    } catch (error) {
      console.error('Heartbeat failed:', error)
    }
  }, 30000)
}

/**
 * Show message
 */
function showMessage(message, type = 'info') {
  const container = document.getElementById('statusMessages')
  if (!container) return

  const alert = document.createElement('div')
  alert.className = `alert alert-${type}`
  alert.textContent = message
  container.appendChild(alert)

  setTimeout(() => alert.remove(), 4000)
}

/**
 * Set loading state
 */
function setIsLoading(loading) {
  const btn = document.getElementById('connectBtn') || document.getElementById('fillFormBtn')
  if (btn) {
    btn.disabled = loading
  }
}

/**
 * Update UI
 */
async function updateUI() {
  const storage = await chrome.storage.local.get(['connected', 'sessionId', 'pendingScanData'])
  const { connected, sessionId, pendingScanData } = storage

  const connectBtn = document.getElementById('connectBtn')
  const disconnectBtn = document.getElementById('disconnectBtn')
  const bridgeStatusCard = document.getElementById('bridgeStatus')
  const dataSection = document.getElementById('dataSection')
  const formSection = document.getElementById('formSection')
  const setupAlert = document.getElementById('setupAlert')
  const fillFormBtn = document.getElementById('fillFormBtn')

  if (connected && sessionId) {
    connectBtn.style.display = 'none'
    disconnectBtn.style.display = 'block'
    bridgeStatusCard.className = 'status-card connected'
    bridgeStatusCard.innerHTML = `
      <div class="status-label">PC Bridge</div>
      <div class="status-value">
        <span class="status-indicator indicator-connected"></span>Online
      </div>
    `
    setupAlert.style.display = 'none'

    if (pendingScanData) {
      dataSection.style.display = 'block'
      formSection.style.display = 'block'
      fillFormBtn.disabled = false
      renderDataPreview(pendingScanData)
    } else {
      dataSection.style.display = 'none'
      formSection.style.display = 'none'
    }
  } else {
    connectBtn.style.display = 'block'
    disconnectBtn.style.display = 'none'
    bridgeStatusCard.className = 'status-card disconnected'
    bridgeStatusCard.innerHTML = `
      <div class="status-label">PC Bridge</div>
      <div class="status-value">
        <span class="status-indicator indicator-disconnected"></span>Offline
      </div>
    `
    setupAlert.style.display = 'block'
    dataSection.style.display = 'none'
    formSection.style.display = 'none'
  }
}

/**
 * Render data preview
 */
function renderDataPreview(data) {
  const preview = document.getElementById('dataPreview')
  if (!preview) return

  const fields = [
    { label: 'Jenis Surat', key: 'letterType' },
    { label: 'Nomor Surat', key: 'letterNumber' },
    { label: 'Subjek', key: 'subject' },
    { label: 'Pengirim', key: 'sender' },
    { label: 'Penerima', key: 'recipient' },
  ]

  let html = ''
  fields.forEach((field) => {
    const value = data[field.key] || '—'
    html += `
      <div class="data-field">
        <span class="data-label">${field.label}</span>
        <span class="data-value">${value}</span>
      </div>
    `
  })

  preview.innerHTML = html
}

// Initialize
document.addEventListener('DOMContentLoaded', updateUI)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'UPDATE_UI') {
    updateUI()
  } else if (request.action === 'SHOW_MESSAGE') {
    showMessage(request.message, request.type)
  }
})
