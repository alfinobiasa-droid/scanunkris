// Background service worker for ScanSurat UNKRIS Extension

/**
 * Listen for messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SCAN_DATA_RECEIVED') {
    handleScanDataReceived(request.data, sender.tab?.id)
    sendResponse({ success: true })
  } else if (request.action === 'FORM_FILLED') {
    handleFormFilled(request.result)
    sendResponse({ success: true })
  }
})

/**
 * Handle scan data received from website via PC Bridge
 */
async function handleScanDataReceived(data, tabId) {
  // Store the data
  await chrome.storage.local.set({
    pendingScanData: data,
    lastDataReceivedAt: new Date().toISOString(),
  })

  // Notify popup to update
  chrome.runtime.sendMessage({
    action: 'UPDATE_UI',
  }).catch(() => {
    // Popup might not be open
  })

  // Show badge notification
  chrome.action.setBadgeText({ text: '!' })
  chrome.action.setBadgeBackgroundColor({ color: '#ef4444' })
}

/**
 * Handle form fill result
 */
async function handleFormFilled(result) {
  const storage = await chrome.storage.local.get(['sessionId', 'bridgeUrl'])
  const { sessionId, bridgeUrl } = storage

  if (sessionId && bridgeUrl) {
    try {
      await fetch(`${bridgeUrl}/api/form/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          result,
        }),
      })
    } catch (error) {
      console.error('Failed to send form result to bridge:', error)
    }
  }
}

/**
 * Handle extension install/update
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage()
  }
})
