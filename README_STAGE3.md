# ScanSurat UNKRIS - Stage 3: OCR & Field Extraction

## Stage 3 Deliverables ✓

### OCR Service (`lib/ocr-service.ts`)
- **Tesseract.js Integration**
  - Singleton pattern untuk OCR worker
  - Indonesian language support
  - Image recognition & text extraction
  - Confidence scoring
  
- **Field Extraction** (`extractFieldsFromText`)
  - Letter type detection (undangan, surat_tugas, etc.)
  - Letter number parsing (XXX/UNKRIS/YYYY format)
  - Subject extraction
  - Sender/recipient identification
  - Date parsing (Indonesian format support)
  - Agenda detection & time extraction
  - Location parsing
  
- **Helper Functions**
  - `detectLetterType()` - Pattern matching untuk jenis surat
  - `extractDates()` - Support berbagai format tanggal
  - `parseIndonesianDate()` - Parse Indonesian month names
  - `extractAgendaTimes()` - Extract HH:MM patterns
  - Confidence scoring untuk setiap field

### OCRResult Component (`components/OCRResult.tsx`)
- **Data Editor UI**
  - Form fields untuk semua extracted data
  - Editable inputs (text, date, datetime, select)
  - Visual feedback untuk fields yang memerlukan verifikasi (red border)
  - Confidence score display
  
- **Field Types**
  - Letter type: dropdown selector
  - Numbers/text: text inputs
  - Dates: date pickers (YYYY-MM-DD format)
  - DateTime: datetime pickers (YYYY-MM-DDTHH:mm)
  - Boolean: checkbox untuk has_agenda
  - Conditional fields: agenda fields tampil jika has_agenda=true
  
- **Expandable Raw OCR Text**
  - Show original OCR text untuk reference
  - Toggle visibility
  
- **Action Buttons**
  - Cancel: return to camera
  - Submit: save ke Supabase & send to PC

### Updated Scanner Component (`components/Scanner.tsx`)
- Integrated dengan OCRResult component
- Flow: Camera/Upload → Preview → OCR Processing → Edit → Submit
- Handles:
  - Photo capture
  - File upload
  - OCR processing
  - Data submission to Supabase
  - Session history update

## Data Flow - Stage 3

```
1. Capture Photo
   ↓
2. Preview Image
   ↓
3. Click "Baca Surat"
   ↓
4. OCR Processing (Tesseract.js)
   - Extract text from image
   - Parse Indonesian text
   ↓
5. Field Extraction
   - detectLetterType()
   - Extract number, subject, sender, recipient
   - parseIndonesianDate()
   - Extract agenda info
   ↓
6. OCRResult Component
   - Display extracted fields
   - Show confidence scores
   - Fields marked red = requires verification
   ↓
7. User Edits & Corrects
   - Fix any incorrect extractions
   - Add missing data
   ↓
8. Submit
   - Save to Supabase scan_data table
   - Update status: 'completed'
   - Add to session history
   ↓
9. PC Bridge Receives
   - Polls /api/scan/pending
   - Displays in extension
   ↓
10. Extension Shows Form
    - User clicks "Isi Form"
    - Content script fills portal form
```

## Field Extraction Logic

### Letter Type Detection
```
Pattern matching:
- "undangan|invitation" → undangan
- "surat tugas|task" → surat_tugas
- "keputusan|decision" → surat_keputusan
- etc.
```

### Date Parsing
Supports:
- Indonesian: "15 Oktober 2026"
- Numeric: "15/10/2026" atau "2026-10-15"
- Abbreviated months: "jan, feb, mar, apr, mei, jun, jul, agu, sep, okt, nov, des"

### Confidence Scoring
- 0.9: High confidence (number extracted)
- 0.8-0.85: Good confidence (subject, date)
- 0.7-0.75: Medium confidence (sender/recipient)
- 0.0: Not found (requires verification)

Fields marked `requiresVerification: true` when:
- No match found (confidence = 0)
- Low confidence pattern
- Ambiguous extraction

## Environment Setup

Sudah tersedia dari Stage 2:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_PC_BRIDGE_URL=http://localhost:3001
```

## Running Stage 3

```bash
# Terminal 1: Website
cd website
npm install  # Install Tesseract.js
npm run dev
# → http://localhost:3000

# Workflow:
1. Click "Mulai Pairing"
2. Verify pairing code
3. "Buka Kamera" → take photo
4. "Baca Surat" → OCR processing (10-30s)
5. Edit fields if needed
6. "Kirim ke PC" → save to Supabase

# Terminal 2: PC Bridge
cd pc-bridge
npm run dev
# Polls Supabase for scan data

# Terminal 3: Chrome Extension
# Polls PC Bridge every 2s for pending data
# Displays in popup
# User clicks "Isi Form"
# Content script fills portal form
```

## Performance Considerations

### OCR Processing
- **First run**: ~30 seconds (downloads model, ~40MB)
- **Subsequent runs**: ~10-20 seconds (cached model)
- Runs on client-side (no server needed)
- May use 100-200MB memory during processing

### Optimization
- Worker initialized once (singleton)
- Image compressed to JPEG (0.95 quality)
- Cleanup after processing
- Consider: Add image preprocessing (crop, denoise) in future

## Known Limitations - Stage 3

1. **OCR Accuracy**
   - Indonesian text recognition: ~85-90% accuracy
   - Handwritten text: Not supported (use typed letters)
   - Low quality images: May have errors
   - Solution: User verification step (red flags)

2. **Date Parsing**
   - Only recognizes common Indonesian format
   - May fail on non-standard formats
   - Solution: User can manually edit date fields

3. **Language Support**
   - Indonesian by default
   - Other languages require model switch

4. **Performance**
   - First OCR slow (model download)
   - Large images may lag mobile devices
   - Solution: Compress/resize image before OCR

5. **No Image Processing**
   - No crop/rotate/denoise features
   - Consider adding in future stage

## Testing - Stage 3

### Test Cases

1. **Indonesian Letter**
   - Use sample Indonesian letter
   - Verify field extraction accuracy
   - Check date parsing

2. **Edge Cases**
   - Missing fields → should show red (requiresVerification)
   - Handwritten → OCR may fail
   - Low quality image → test accuracy

3. **Manual Correction**
   - Edit extracted fields
   - Verify changes save correctly
   - Submit to Supabase

4. **Session History**
   - After submit, should appear in history
   - Correct date & time
   - Correct status

### Sample Test Letters
Create test PDFs/images with:
- Full format letter (all fields)
- Minimal letter (missing fields)
- Handwritten elements
- Poor quality scans

## Supabase Query - Verify Submission

```sql
-- Check last scan data
SELECT * FROM scan_data 
ORDER BY created_at DESC 
LIMIT 10;

-- Check with OCR data
SELECT 
  id, 
  letter_type, 
  letter_number, 
  subject, 
  ocr_confidence,
  status,
  created_at
FROM scan_data
WHERE pairing_session_id = 'your-session-id'
ORDER BY created_at DESC;
```

## Troubleshooting - Stage 3

### "OCR not initialized"
- Check tsconfig has "WebWorker" in lib
- Verify Tesseract.js installed: `npm install tesseract.js`
- Check browser console for errors

### "OCR processing stuck"
- First run downloads model (~40MB) - takes time
- Check network connection
- Try with smaller image
- Check browser memory

### "Field extraction incorrect"
- Check OCR text (expand "Teks OCR Asli")
- Pattern matching may need tuning
- User can manually edit fields
- Low confidence fields highlighted in red

### "Date not parsing"
- Verify format is Indonesian (e.g., "15 Oktober 2026")
- Check OCR text for correct month name
- Manual edit in date picker as fallback

### "Tesseract.js build error"
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version (need 16+)
- Try: `npm install --force`

## Next: Stage 4 - Deployment

- Deploy website to Vercel
- Optimize OCR for production
- Setup environment variables on Vercel
- Document deployment steps
- Create production checklist

## Database - Stage 3 Status

After Stage 3 submission, `scan_data` table contains:
```
✓ letter_type (extracted)
✓ letter_number (extracted)
✓ subject (extracted)
✓ sender (extracted)
✓ recipient (extracted)
✓ letter_date (extracted & normalized)
✓ received_date (extracted & normalized)
✓ description (empty - user can fill)
✓ has_agenda (extracted)
✓ agenda_start (extracted)
✓ agenda_end (extracted)
✓ agenda_location (extracted)
✓ ocr_raw_text (full OCR result)
✓ ocr_confidence (average confidence score)
✓ status = 'completed'
```

---

**Stage 3 Complete**: OCR Integration + Field Extraction
**Status**: Ready for Stage 4 (Deployment to Vercel)

**Key Achievement**: End-to-end flow now works:
- HP captures → OCR reads → Edit fields → Submit to PC → Extension fills form
