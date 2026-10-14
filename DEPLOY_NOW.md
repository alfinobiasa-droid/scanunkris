# 🚀 ScanSurat UNKRIS - Deploy to Vercel NOW

## Siap Deploy? Follow These Steps ✓

---

## STEP 1: Verify Local Setup (5 min)

Open Command Prompt/PowerShell:

```bash
# Navigate to project
cd C:\Users\puskom\Documents\scansurat-unkris

# Verify git initialized
git status

# If not git repo yet:
git init
git add .
git commit -m "ScanSurat UNKRIS v1.0 - Full-stack OCR document scanner"
```

---

## STEP 2: Push to GitHub (10 min)

### 2A. Create GitHub Repo

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `scansurat-unkris`
   - **Description**: "Full-stack document scanner with OCR for UNKRIS portal"
   - **Visibility**: PUBLIC (required for free Vercel)
3. Click "Create repository"
4. Copy the repo URL (looks like: `https://github.com/USERNAME/scansurat-unkris.git`)

### 2B. Push Code

```bash
cd scansurat-unkris

# Set remote (replace URL with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/scansurat-unkris.git
git branch -M main
git push -u origin main

# Verify at: https://github.com/YOUR_USERNAME/scansurat-unkris
```

---

## STEP 3: Create Vercel Project (10 min)

### 3A. Import from GitHub

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Paste your repo URL: `https://github.com/YOUR_USERNAME/scansurat-unkris.git`
5. Click **"Import"**

### 3B. Add Environment Variables

After import, Vercel shows **"Configure Project"** screen.

Click **"Environment Variables"** and add these 5 variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (your ANON key) |
| `NEXT_PUBLIC_PC_BRIDGE_URL` | `http://localhost:3001` |
| `NEXT_PUBLIC_APP_ENV` | `production` |
| `NEXT_PUBLIC_APP_URL` | `https://scansurat-unkris.vercel.app` |

**Where to get Supabase keys**:
- Go to Supabase dashboard
- Settings → API
- Copy **Project URL** → NEXT_PUBLIC_SUPABASE_URL
- Copy **anon public** → NEXT_PUBLIC_SUPABASE_ANON_KEY

### 3C. Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. See green checkmark ✓ when done
4. Click **"Visit"** to go to production URL

---

## STEP 4: Test Production URL (10 min)

### 4A. Basic Load Test
```
1. Click "Visit" link from Vercel
2. Should go to: https://scansurat-unkris.vercel.app
3. See ScanSurat header + "Mulai Pairing" button
4. Check HTTPS lock icon in URL bar
5. Press F12 → Console tab → should be clean (no red errors)
```

### 4B. Pairing Test
```
1. Click "Mulai Pairing" → QR appears
2. Open Chrome → chrome://extensions
3. Find "ScanSurat UNKRIS" extension
4. Click extension → popup opens
5. Click "Hubungkan ke Website"
6. Wait for status to show "Online"
7. Enter 6-digit code from website
8. Click "Verifikasi"
9. Should show "Pairing Berhasil!" on website
```

### 4C. Camera Test
```
1. After pairing, click "Buka Kamera"
2. Grant camera permission if prompted
3. Take photo
4. Click "Baca Surat"
5. Wait for OCR (10-30 seconds)
6. Should see form with extracted fields
```

### 4D. Quick Data Test
```
1. Click "Kirim ke PC"
2. No error shown
3. Go to Supabase dashboard
4. Tables → scan_data
5. Should see new row with your data
```

---

## STEP 5: Start PC Bridge (2 min)

### 5A. For Production Testing

```bash
cd C:\Users\puskom\Documents\scansurat-unkris\pc-bridge

# Option 1: Double-click
start.bat

# Option 2: Command line
npm run dev
```

Should show:
```
✓ PC Bridge running at http://localhost:3001
✓ Supabase connected
```

### 5B. Test Extension Connection
```
1. Extension popup should show "PC Bridge: Online" (green)
2. Extension should show "Data Scan Terbaru" if you sent data
3. "Isi Form" button should be enabled
```

---

## STEP 6: Deploy Success! 🎉

**Production URL**: `https://scansurat-unkris.vercel.app`

**What's Live**:
- ✓ Website accessible worldwide on HTTPS
- ✓ Camera works (HTTPS required ✓)
- ✓ OCR processes images
- ✓ Data syncs to Supabase
- ✓ PC Bridge receives updates (locally)
- ✓ Chrome Extension fills forms

---

## If Something Breaks

### Quick Rollback
```bash
git revert HEAD
git push origin main
# Vercel auto-redeploys (~2 min)
```

### Or via Dashboard
1. Vercel dashboard → Deployments
2. Click previous working build
3. Click "Redeploy"

---

## Next: Share & Use

**Share these URLs with users**:
```
Website: https://scansurat-unkris.vercel.app
Chrome Extension: Load from chrome-extension/ folder
Portal: https://puskom.unkris.ac.id/letters/create
```

**For Each User on PC**:
1. Install Chrome Extension (chrome://extensions → Load unpacked)
2. Double-click `pc-bridge/start.bat`
3. Open website URL in Chrome
4. Start scanning!

---

## Monitoring

**Check daily**:
- Vercel dashboard for build status
- Supabase for usage metrics
- Browser console for errors

**Check weekly**:
- Test key workflows
- Monitor for issues
- Review logs

---

## Congratulations! 🚀

ScanSurat UNKRIS is now **live in production**!

**Architecture Summary**:
```
HP (Production): https://scansurat-unkris.vercel.app
    ↓
PC Bridge (Local): http://localhost:3001
    ↓
Chrome Extension (Local): Fills portal forms
    ↓
Portal: https://puskom.unkris.ac.id/letters/create
    ↓
User: Manually saves in portal
```

---

## Questions?

Refer to:
- `DEPLOYMENT_QUICK_START.md` (in project)
- `DEPLOYMENT_GUIDE.md` (detailed steps)
- `docs/WINDOWS_SETUP.md` (Windows setup)
- Browser console (F12) for error details

---

**Deployment Time**: ~45 minutes total
**Status**: READY FOR PRODUCTION ✓
