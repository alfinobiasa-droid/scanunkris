# ScanSurat UNKRIS - Stage 2: QR Pairing & Realtime Relay

## Stage 2 Deliverables ✓

### Website Scanner (Next.js)
- ✓ **Pairing.tsx component** - QR code generation & validation
  - Display QR code untuk dipindai HP
  - 6-digit pairing code (user-friendly)
  - Verification input
  - Secure token generation
  - Session creation in Supabase
  
- ✓ **Supabase Service** (`supabase-service.ts`)
  - Create/verify pairing sessions
  - Update pairing status
  - Real-time subscriptions
  - Scan data operations
  
- ✓ **Realtime Relay** (`realtime-relay.ts`)
  - Channel subscriptions untuk scan data
  - Connection status monitoring
  - Form fill results listening

### PC Bridge (Node.js)
- ✓ **Supabase Integration**
  - Service role client untuk admin operations
  - Update scan data status
  - Log form results ke database
  
- ✓ **Enhanced Endpoints**
  - `/api/extension/register` - Accept pairingSessionId
  - `/api/scan/submit` - Update status in Supabase
  - `/api/form/result` - Log results to database

### Chrome Extension
- ✓ **Supabase Client Integration**
  - Embed Supabase JS library
  - Polling mechanism untuk scan data
  - Real-time updates untuk connection status
  
- ✓ **Enhanced Popup**
  - Polling every 2 seconds untuk pending data
  - Badge notification saat data diterima
  - Form fill dengan status reporting

### Documentation
- ✓ **SQL Migrations** (`supabase-migrations.sql`)
  - Tables: pairing_sessions, scan_data, connection_status, form_fill_results
  - RLS policies untuk security
  - Real-time publication setup
  - Indexes untuk performance
  
- ✓ **Supabase Setup Guide** (`SUPABASE_SETUP.md`)
  - Step-by-step project creation
  - Environment variables
  - RLS verification
  - Troubleshooting

## Architecture - Stage 2

```
HP (Website Vercel)
    ↓
    Pairing.tsx (QR + verification)
    ↓
Supabase Database
    ├── pairing_sessions (create & update)
    ├── scan_data (insert scan)
    └── [Realtime channel]
         ↓
    PC Bridge (Node.js localhost:3001)
         ↓
    Chrome Extension
         └── (polling every 2s)
```

## Data Flow - Stage 2

### 1. **Pairing Flow**
```
User clicks "Mulai Pairing"
    ↓
Website creates pairing_session in Supabase
    ↓
QR Code displayed (contains qr_token)
    ↓
User scans QR + enters verification code
    ↓
Verify pairing code in database
    ↓
Update session: status='paired', mobile_connected=true
    ↓
Extension receives pairingSessionId
```

### 2. **Scan Submission Flow**
```
HP submits scan_data to Supabase
    ↓
Supabase inserts into scan_data table
    ↓
[Realtime channel notify PC Bridge]
    ↓
Extension polls /api/scan/pending
    ↓
PC Bridge returns stored scan data
    ↓
Extension displays in popup
    ↓
User clicks "Isi Form"
```

### 3. **Form Fill Flow**
```
Content script fills form fields
    ↓
Extension sends result to PC Bridge
    ↓
PC Bridge logs to form_fill_results table
    ↓
Website can query results via Supabase
```

## Environment Setup

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Get keys from Settings → API

### 2. Run SQL Migrations
- Copy content dari `docs/supabase-migrations.sql`
- Paste di Supabase SQL Editor
- Execute

### 3. Set Environment Variables

**website/.env.local**:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (keep secret!)
NEXT_PUBLIC_PC_BRIDGE_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

**pc-bridge/.env**:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
BRIDGE_PORT=3001
BRIDGE_HOST=localhost
NODE_ENV=development
```

## Running Stage 2

```bash
# Terminal 1: Website
cd website
npm install  # if needed
npm run dev
# → http://localhost:3000

# Terminal 2: PC Bridge
cd pc-bridge
npm install  # if needed
npm run dev
# → http://localhost:3001 (with Supabase connected)

# Terminal 3: Chrome Extension
# chrome://extensions → Load unpacked → chrome-extension/
```

## Testing Flow

1. **Website** (`http://localhost:3000`)
   - Click "Mulai Pairing"
   - QR Code appears
   - Copy 6-digit code

2. **Chrome Extension**
   - Click "Hubungkan ke Website"
   - Status berubah ke "Online"
   - Waiting untuk scan data

3. **Website** (simulasi HP)
   - Masukkan pairing verification code dari popup
   - Click "Verifikasi"
   - Status: "Pairing Berhasil!"

4. **Upload Photo** (simulating OCR later)
   - Next stage akan add OCR

5. **Submit Scan**
   - Data masuk ke Supabase
   - PC Bridge receives via polling
   - Extension popup menampilkan data

6. **Fill Form**
   - Open portal di tab lain
   - Click "Isi Form" di extension
   - Content script fills form fields
   - Result logged ke Supabase

## Security Improvements - Stage 2

✓ **Implemented**:
- Pairing tokens dengan expiration (15 menit)
- QR token validation
- RLS policies di semua tabel
- Service role client terpisah untuk admin ops
- Session-based access control

⚠️ **Still needed** (Stage 3):
- JWT authentication
- User accounts
- Encryption at rest
- Rate limiting
- HTTPS enforcement (production)

## Database Schema - Stage 2

### pairing_sessions
- id (UUID)
- pairing_code (VARCHAR 6) - User-friendly code
- qr_token (VARCHAR 64) - Cryptographic token
- status (pending/paired/expired/revoked)
- mobile_connected, pc_connected (BOOLEAN)
- expires_at (TIMESTAMP)
- created_at, updated_at

### scan_data
- id (UUID)
- pairing_session_id (FK)
- letter_type, letter_number, subject, sender, recipient
- dates, description, agenda info
- ocr_raw_text, ocr_confidence
- status (processing/completed/failed)
- created_at, updated_at

### connection_status
- id (UUID)
- pairing_session_id (FK, UNIQUE)
- mobile/pc/extension last_heartbeat
- is_active (BOOLEAN)

### form_fill_results
- id (UUID)
- scan_data_id (FK)
- filled_fields, failed_fields
- success, message
- completed_at

## Performance Notes

- Pairing tokens expire dalam 15 menit (security)
- Extension polls every 2 seconds (low latency untuk UX)
- RLS policies enable fine-grained access control
- Indexes pada frequently-queried columns

## Known Limitations - Stage 2

1. **No OCR yet** - Photos won't be read, just stored
2. **No JWT** - Using session-based pairing instead
3. **No rate limiting** - Will be added in Stage 3
4. **Polling only** - Realtime channels prepared but not used by extension yet (will improve in Stage 3)
5. **No encryption** - Data stored plaintext in Supabase (consider adding in production)

## Next: Stage 3

- Implement OCR dengan Tesseract.js
- Extract letter fields dari text
- Add form field editor untuk koreksi
- Improve extension realtime connection
- Add authentication untuk users

## Troubleshooting

### "Supabase not connected"
- Check `.env` file has correct keys
- Verify Supabase project status
- Test dengan: `curl https://your-project.supabase.co/rest/v1/`

### "Pairing code invalid"
- Check expiration (should be 15 min)
- Verify QR token matches database
- Check database connection

### "Form data not appearing in extension"
- Verify polling is active (check browser console)
- Check PC Bridge is running
- Verify Supabase has scan_data entry

### "RLS policy error"
- Go to Supabase SQL Editor
- Run SELECT * FROM pairing_sessions (should work or show policy error)
- Check RLS policies in Policies tab

---

**Stage 2 Complete**: QR Pairing + Realtime infrastructure ready
**Status**: Ready for Stage 3 (OCR + Field Extraction)
