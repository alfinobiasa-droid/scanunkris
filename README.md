# ScanSurat UNKRIS - Stage 1: Project Setup & Website Scanner

## Project Overview

**ScanSurat UNKRIS** adalah aplikasi full-stack untuk memindai dokumen fisik via smartphone, membaca teks menggunakan OCR, dan mengirimkan data ke PC agar Chrome Extension dapat mengisi form portal UNKRIS secara otomatis.

Aplikasi ini terdiri dari 4 komponen utama:
1. **Website Scanner** (Next.js) - Aplikasi web di Vercel untuk pemindaian
2. **Realtime Relay** (Supabase) - Layanan realtime untuk komunikasi
3. **PC Bridge** (Node.js) - Jembatan lokal di Windows
4. **Chrome Extension** (Manifest V3) - Pengisi form portal

## Stage 1 Deliverables

Pada stage ini, kami telah membuat:

### ✓ Website Scanner (Next.js + TypeScript + Tailwind)
- Struktur project dengan App Router
- Halaman utama dengan status koneksi
- Komponen Scanner dengan dukungan kamera dan upload foto
- Zustand store untuk state management
- Utility functions untuk pairing dan data normalisasi
- Environment configuration untuk Supabase dan PC Bridge

### ✓ PC Bridge (Node.js + Express)
- Server Express untuk menerima dan meneruskan data
- Endpoints untuk registrasi extension
- Heartbeat mechanism untuk monitoring koneksi
- Penampungan data scan sementara
- Error handling yang proper

### ✓ Chrome Extension (Manifest V3)
- Popup UI dengan status indicators
- Connection management
- Data preview
- Form fill interface
- Background service worker
- Content script untuk form filling

### ✓ Type Definitions & Utilities
- TypeScript interfaces untuk semua data structures
- Utility functions: pairing code generation, date normalization
- Secure token generation

## Project Structure

```
scansurat-unkris/
├── package.json (monorepo root)
├── .gitignore
├── website/                    # Next.js scanner
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Scanner.tsx
│   │   ├── Status.tsx
│   │   └── SessionHistory.tsx
│   ├── lib/
│   │   ├── types.ts
│   │   ├── supabase.ts
│   │   ├── store.ts
│   │   └── utils.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── postcss.config.js
│   └── .env.example
├── pc-bridge/                  # Node.js server
│   ├── src/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── chrome-extension/           # Chrome extension
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    ├── background.js
    ├── content.js
    └── images/
```

## Cara Setup

### Prerequisites
- Node.js 18+ dan npm/yarn
- Chrome Browser
- Git

### 1. Clone & Install Dependencies

```bash
# Clone repository
cd C:\Users\puskom\Documents\scansurat-unkris

# Install root dependencies
npm install

# Install workspace dependencies
cd website && npm install
cd ../pc-bridge && npm install
cd ..
```

### 2. Environment Setup

**Website (`website/.env.local`)**:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_PC_BRIDGE_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

**PC Bridge (`pc-bridge/.env`)**:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BRIDGE_PORT=3001
BRIDGE_HOST=localhost
NODE_ENV=development
```

### 3. Run Locally

```bash
# Terminal 1: Website Scanner
cd website
npm run dev
# Website akan berjalan di http://localhost:3000

# Terminal 2: PC Bridge
cd pc-bridge
npm run dev
# PC Bridge akan berjalan di http://localhost:3001

# Terminal 3: Chrome Extension
# Load chrome-extension folder via chrome://extensions > Load unpacked
```

### 4. Install Chrome Extension

1. Buka `chrome://extensions`
2. Aktifkan "Developer mode" (toggle di kanan atas)
3. Klik "Load unpacked"
4. Pilih folder `chrome-extension`
5. Extension akan muncul di toolbar

## Current Features (Stage 1)

### Website Scanner
- ✓ Responsive design untuk HP dan desktop
- ✓ Camera access dengan fallback upload
- ✓ Photo preview
- ✓ Session history (temporary, in-memory)
- ✓ Connection status indicator
- ✓ Error handling

### PC Bridge
- ✓ Health check endpoint
- ✓ Status monitoring
- ✓ Extension registration
- ✓ Heartbeat mechanism
- ✓ Temporary data storage (in-memory)
- ✓ CORS configuration

### Chrome Extension
- ✓ Popup UI dengan status indicators
- ✓ Connect/Disconnect buttons
- ✓ Data preview section
- ✓ Form fill interface
- ✓ Bridge communication
- ✓ Background worker & content script

## What's Missing (Will be implemented in Stage 2-5)

- ❌ Supabase integration (currently using in-memory storage)
- ❌ QR code pairing
- ❌ Real-time WebSocket/Channel subscriptions
- ❌ OCR with Tesseract.js
- ❌ Form field extraction
- ❌ Production deployment to Vercel
- ❌ Proper authentication & session management
- ❌ SQL migrations

## Security Notes for Current Stage

⚠️ **Important**: Stage 1 menggunakan in-memory storage dan tidak memiliki enkripsi. Ini hanya untuk development testing.

Sebelum production:
- Implementasikan Supabase RLS (Row Level Security)
- Gunakan JWT untuk authentication
- Encrypt sensitive data
- Implement proper rate limiting
- Add CSRF protection

## Testing the Flow (Manual)

1. Buka website di `http://localhost:3000`
2. Lihat "Belum terhubung ke PC" (pairing akan di Stage 2)
3. Coba buka kamera atau upload foto
4. Buka Chrome Extension popup
5. Klik "Hubungkan ke Website"
6. Lihat status bridge berubah ke "Online"

## Deployment Roadmap

**Stage 2**: QR Pairing + Realtime Relay
- Supabase setup dengan tabel pairing
- QR code generation & validation
- Real-time channel subscriptions

**Stage 3**: PC Bridge + Extension Integration
- Supabase authentication
- Real-time data sync
- Improved session management

**Stage 4**: OCR & Field Extraction
- Tesseract.js integration
- Form field detection
- Data normalization

**Stage 5**: Production Deployment
- Vercel deployment
- Environment optimization
- Complete documentation

## Troubleshooting

### Website tidak berjalan?
```bash
cd website
npm install
npm run dev
```

### PC Bridge tidak berjalan?
```bash
cd pc-bridge
npm install
npm run dev
# Pastikan port 3001 tidak terpakai
```

### Chrome Extension tidak muncul?
- Pastikan `chrome://extensions` Developer mode ON
- Reload extension setelah perubahan
- Check browser console untuk errors

### Kamera tidak berfungsi?
- Berikan permission akses kamera
- Test di HTTPS (di Vercel, kamera perlu HTTPS)
- Coba browser lain

## Next Steps

Untuk Stage 2, kami akan:
1. Setup Supabase project dengan tabel dan RLS
2. Implementasikan QR code pairing
3. Integrate real-time channels
4. Tambahkan authentication

---

**Created**: 2026-10-14
**Version**: 1.0.0 - Stage 1 (Initial Setup)
