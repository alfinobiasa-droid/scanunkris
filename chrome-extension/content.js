// Content script for form filling on UNKRIS portal

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'FILL_FORM') {
    fillPortalForm(request.data, sendResponse)
    return true // Keep channel open for async response
  }
})

/**
 * Fill the UNKRIS portal form with scan data
 */
async function fillPortalForm(scanData, callback) {
  try {
    // Check if we're on the right page
    const isCorrectPage = window.location.href.includes('puskom.unkris.ac.id/letters/create')
    if (!isCorrectPage) {
      callback({
        success: false,
        message: 'Buka halaman formulir surat di portal UNKRIS',
      })
      return
    }

    const result = {
      filledFields: [],
      failedFields: [],
    }

    // Define form field mappings
    const fieldMappings = [
      { selector: 'select[name="letter_type"], #letter-type', value: scanData.letterType, label: 'Jenis Surat' },
      { selector: 'input[name="letter_number"]', value: scanData.letterNumber, label: 'Nomor Surat' },
      { selector: 'input[name="subject"]', value: scanData.subject, label: 'Subjek' },
      { selector: 'input[name="sender"]', value: scanData.sender, label: 'Pengirim' },
      { selector: 'input[name="recipient"]', value: scanData.recipient, label: 'Penerima' },
      { selector: 'input[name="letter_date"]', value: scanData.letterDate, label: 'Tanggal Surat', type: 'date' },
      { selector: 'input[name="received_date"]', value: scanData.receivedDate, label: 'Tanggal Diterima', type: 'date' },
      { selector: 'textarea[name="description"]', value: scanData.description, label: 'Deskripsi' },
    ]

    // Fill each field
    for (const mapping of fieldMappings) {
      if (!mapping.value) continue

      const element = document.querySelector(mapping.selector)
      if (!element) {
        result.failedFields.push({
          field: mapping.label,
          reason: 'Elemen tidak ditemukan di form',
        })
        continue
      }

      try {
        // Validate element type
        const tagName = element.tagName.toLowerCase()

        if (tagName === 'select') {
          element.value = mapping.value
          element.dispatchEvent(new Event('change', { bubbles: true }))
        } else if (tagName === 'input') {
          element.value = mapping.value
          element.dispatchEvent(new Event('input', { bubbles: true }))
          element.dispatchEvent(new Event('change', { bubbles: true }))
        } else if (tagName === 'textarea') {
          element.value = mapping.value
          element.dispatchEvent(new Event('input', { bubbles: true }))
          element.dispatchEvent(new Event('change', { bubbles: true }))
        }

        // Verify value was set
        if (element.value === mapping.value) {
          result.filledFields.push(mapping.label)
        } else {
          result.failedFields.push({
            field: mapping.label,
            reason: 'Nilai tidak berhasil diatur',
          })
        }
      } catch (error) {
        result.failedFields.push({
          field: mapping.label,
          reason: error instanceof Error ? error.message : 'Error tidak diketahui',
        })
      }
    }

    // Handle agenda checkbox and fields if has_agenda is true
    if (scanData.hasAgenda) {
      const agendaCheckbox = document.querySelector('input[name="has_agenda"]')
      if (agendaCheckbox) {
        agendaCheckbox.checked = true
        agendaCheckbox.dispatchEvent(new Event('change', { bubbles: true }))
        result.filledFields.push('Checkbox Agenda')
      }

      // Fill agenda fields
      const agendaFields = [
        { selector: 'input[name="agenda_start"]', value: scanData.agendaStart, label: 'Tanggal Mulai Agenda' },
        { selector: 'input[name="agenda_end"]', value: scanData.agendaEnd, label: 'Tanggal Selesai Agenda' },
        { selector: 'input[name="agenda_location"]', value: scanData.agendaLocation, label: 'Lokasi Agenda' },
      ]

      for (const mapping of agendaFields) {
        if (!mapping.value) continue

        const element = document.querySelector(mapping.selector)
        if (!element) {
          result.failedFields.push({
            field: mapping.label,
            reason: 'Elemen tidak ditemukan',
          })
          continue
        }

        try {
          element.value = mapping.value
          element.dispatchEvent(new Event('input', { bubbles: true }))
          element.dispatchEvent(new Event('change', { bubbles: true }))
          result.filledFields.push(mapping.label)
        } catch (error) {
          result.failedFields.push({
            field: mapping.label,
            reason: error instanceof Error ? error.message : 'Error',
          })
        }
      }
    }

    callback({
      success: true,
      message: `Form berhasil diisi: ${result.filledFields.length} field, ${result.failedFields.length} error`,
      result,
    })

    // Notify background script
    chrome.runtime.sendMessage({
      action: 'FORM_FILLED',
      result,
    })
  } catch (error) {
    console.error('Form fill error:', error)
    callback({
      success: false,
      message: error instanceof Error ? error.message : 'Gagal mengisi form',
    })
  }
}
