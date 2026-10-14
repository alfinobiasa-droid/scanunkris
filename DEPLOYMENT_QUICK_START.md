# ScanSurat UNKRIS - Deployment Checklist & Quick Start

## Pre-Deployment Checklist

### Local Testing (5 min)
- [ ] Website builds locally: `npm run build` (no errors)
- [ ] PC Bridge runs: `npm run dev` di pc-bridge folder
- [ ] Chrome Extension loads: chrome://extensions
- [ ] Test pairing QR flow
- [ ] Test camera/upload photo
- [ ] Test OCR processing
- [ ] No console errors (F12)

### Files Ready
- [ ] .env files created (website/.env.local, pc-bridge/.env)
- [ ] Supabase project active (from Stage 2)
- [ ] All code committed locally
- [ ] No uncommitted changes: `git status`

---

## Deployment Steps (20 minutes)

### Step 1: Create GitHub Repository (5 min)

```bash
# If not already initialized
cd scansurat-unkris
git init
git add .
git commit -m "ScanSurat UNKRIS v1.0 - Full-stack document scanner with OCR"

# Go to https://github.com/new
# Create repository: scansurat-unkris (PUBLIC)
# Copy repo URL from GitHub

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/scansurat-unkris.git
git branch -M main
git push -u origin main

# Verify at github.com/YOUR_USERNAME/scansurat-unkris
```

### Step 2: Create Vercel Project (10 min)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Paste: `https://github.com/YOUR_USERNAME/scansurat-unkris.git`
5. Click "Import"

### Step 3: Configure Environment Variables (5 min)

After importing, Vercel shows "Configure Project" screen.

Click "Environment Variables" and add:

```
NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGc... (your ANON key from Supabase)

NEXT_PUBLIC_PC_BRIDGE_URL
Value: http://localhost:3001

NEXT_PUBLIC_APP_ENV
Value: production

NEXT_PUBLIC_APP_URL
Value: https://scansurat-unkris.vercel.app
```

✓ Click "Deploy" when ready

### Step 4: Wait for Deployment (2-3 min)

Vercel will:
1. Build the project
2. Create production bundle
3. Deploy to global CDN
4. Show you the URL

Watch the build progress - should show:
```
✓ Build completed
✓ Deployment complete
Visit: https://your-project.vercel.app
```

### Step 5: Verify Website Works (2 min)

Click "Visit" or go to deployment URL:
```
https://scansurat-unkris.vercel.app
```

Should see:
- [ ] ScanSurat header loads
- [ ] "Mulai Pairing" button visible
- [ ] No console errors (F12)
- [ ] HTTPS lock icon in URL bar

---

## Production Testing (15 minutes)

### Test 1: Basic UI (2 min)
```
1. Open https://your-project.vercel.app
2. Page loads completely
3. No errors in console (F12)
4. Responsive on mobile size
5. Click "Mulai Pairing" → should show QR code
```

### Test 2: Pairing Flow (5 min)
```
1. Website: Click "Mulai Pairing"
2. Should see: QR code + 6-digit code
3. PC: Open Chrome Extension (icon in toolbar)
4. Extension: Click "Hubungkan ke Website"
5. Extension: Wait for status to show "Online"
6. Website: Enter 6-digit code from popup
7. Website: Click "Verifikasi"
8. Should show: "Pairing Berhasil!"
9. Extension: Status shows "Online"

✓ If all above work: Pairing successful
```

### Test 3: Camera/Upload (3 min)
```
1. Website: Click "Buka Kamera"
2. Allow camera permission if prompted
3. Camera should open
4. Take photo with "Ambil Foto"
5. Should see preview
6. Click "Baca Surat"
7. Should see loading spinner (OCR processing)
8. Wait 10-30 seconds for OCR to complete

✓ If OCR result shows: Camera & OCR working
```

### Test 4: Data Submission (3 min)
```
1. After OCR: Edit a field (to verify it's editable)
2. Click "Kirim ke PC"
3. Should show success message
4. Check Supabase dashboard:
   - Go to Supabase
   - Tables → scan_data
   - Should see new entry
5. Extension popup: Check for "Data Scan Terbaru"
6. Extension should show data received

✓ If data appears: Submission & sync working
```

### Test 5: Form Filling (2 min)
```
1. Open https://puskom.unkris.ac.id/letters/create in new tab
2. Login if not already
3. Extension: Click "Isi Form"
4. Portal page: Form fields should auto-fill
5. Check fields: Are they populated correctly?
6. DO NOT save - just verify fields are filled

✓ If form fields filled: Form filling working
```

---

## Production Issues & Fixes

### Website Won't Load
```
Error: Connection refused / Cannot reach server
```
**Fix**:
- Check Vercel deployment status (go to Vercel dashboard)
- Check environment variables are set correctly
- Verify Supabase URL format

### Camera Not Working
```
Error: Permission denied / Not supported
```
**Fix**:
- Chrome requires HTTPS (Vercel has this ✓)
- Grant camera permission when prompted
- Try on different browser/device
- Check chrome://settings/contentExceptions#media-stream_camera

### PC Bridge Not Connecting
```
Error: PC Bridge Offline
```
**Fix**:
- Start PC Bridge: Double-click `pc-bridge/start.bat`
- Should show: `✓ PC Bridge running at http://localhost:3001`
- Firewall: Allow localhost:3001
- Verify NEXT_PUBLIC_PC_BRIDGE_URL in Vercel is correct

### OCR Not Processing
```
Error: Timed out / Failed to process
```
**Fix**:
- First run downloads ~40MB model (takes 30s)
- Subsequent runs faster (cached)
- Check browser console (F12) for errors
- Tesseract.js needs WebWorker support

### Form Not Filling
```
Error: Form fields empty after clicking Isi Form
```
**Fix**:
- Verify portal form structure matches selectors
- Check browser console for errors
- Make sure portal form has data to fill
- Test with Chrome DevTools Network tab to see POST requests

---

## Monitoring After Deployment

### Daily
- [ ] Test pairing flow works
- [ ] Verify OCR processing
- [ ] Check form filling on portal

### Weekly
- [ ] Monitor Supabase usage (Settings → Usage)
- [ ] Check Vercel build logs (Deployments)
- [ ] Test on different devices (mobile, desktop)
- [ ] Verify all features work

### Monthly
- [ ] Review error logs
- [ ] Download Supabase backup
- [ ] Update dependencies if needed
- [ ] Check for security updates

---

## Rollback (If Needed)

If production breaks:

```bash
# Option 1: Revert last commit
git revert HEAD
git push origin main
# Vercel auto-redeploys (~2 min)

# Option 2: Vercel dashboard
1. Go to https://vercel.com/dashboard
2. Click project
3. Go to "Deployments"
4. Find previous successful build
5. Click "..." → "Redeploy"
```

---

## Success Criteria

✓ **Deployment Successful When**:
- Website loads at production URL (HTTPS)
- Camera works and captures photos
- OCR processes images correctly
- Extension receives data
- Form fields fill automatically
- No console errors
- Mobile responsiveness works
- All features from local test work in production

---

## Next Actions

1. Follow "Deployment Steps" above (20 min)
2. Follow "Production Testing" to verify (15 min)
3. All passing → **Deployment Complete!**
4. Share production URL

---

## Support

If stuck:
- Check browser console (F12) for error messages
- Review DEPLOYMENT_GUIDE.md in docs/
- Check Vercel dashboard logs
- Verify environment variables in Vercel settings
- Test locally first if in doubt

**Total deployment time**: ~45 minutes (including testing)
