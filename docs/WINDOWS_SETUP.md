# Windows Setup Guide - ScanSurat UNKRIS

## Complete Setup for Windows PC

### Prerequisites
- Windows 10/11
- Admin access to install software
- Chrome browser
- GitHub account (for deployment)
- Supabase account (created in Stage 2)

---

## Part 1: Install Node.js

1. Go to https://nodejs.org/
2. Download **LTS (Long Term Support)** version
3. Run installer
   - Accept license
   - Choose install location (default OK)
   - Check "Add to PATH" ✓
   - Click Install
4. Verify installation:
   ```
   node --version
   npm --version
   ```

---

## Part 2: Clone Repository

1. Open Command Prompt or PowerShell
2. Navigate to Documents folder:
   ```
   cd Documents
   ```
3. Clone the project:
   ```
   git clone https://github.com/YOUR_USERNAME/scansurat-unkris.git
   cd scansurat-unkris
   ```

---

## Part 3: Install Dependencies

```bash
# Install root dependencies (Turbo)
npm install

# Install website dependencies
cd website
npm install
cd ..

# Install PC Bridge dependencies
cd pc-bridge
npm install
cd ..
```

---

## Part 4: Environment Configuration

### Website Configuration
Create `website/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (your key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (your key)
NEXT_PUBLIC_PC_BRIDGE_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

### PC Bridge Configuration
Create `pc-bridge/.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (your key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (your key)
BRIDGE_PORT=3001
BRIDGE_HOST=localhost
NODE_ENV=development
```

---

## Part 5: Setup PC Bridge Startup Scripts

The `start.bat` script is already created at:
```
C:\Users\{username}\Documents\scansurat-unkris\pc-bridge\start.bat
```

### Usage

**Option 1: Double-click**
1. Open File Explorer
2. Navigate to `pc-bridge` folder
3. Double-click `start.bat`
4. Command window opens with bridge running

**Option 2: Create Shortcut**
1. Right-click `start.bat`
2. Create Shortcut
3. Rename: "ScanSurat PC Bridge"
4. Right-click → Properties → Advanced → "Run as administrator" ✓
5. Move to Desktop for easy access

**Option 3: Command Line**
```bash
cd C:\Users\{username}\Documents\scansurat-unkris\pc-bridge
start.bat
```

### What Should Happen
```
[OK] Node.js detected: v18.x.x
[OK] Created .env file (first run)
[INFO] Installing dependencies...
[INFO] Starting PC Bridge...
[INFO] Bridge will run on: http://localhost:3001
✓ PC Bridge running at http://localhost:3001
✓ Environment: development
✓ Supabase connected
```

### Stop Bridge
- Press `Ctrl+C` in command window, or
- Run `stop.bat` from same folder

---

## Part 6: Install Chrome Extension

1. Open Chrome
2. Go to `chrome://extensions`
3. Toggle "Developer mode" (top right)
4. Click "Load unpacked"
5. Navigate to: `C:\Users\{username}\Documents\scansurat-unkris\chrome-extension`
6. Click Select Folder
7. Extension appears in toolbar

---

## Part 7: Test Locally

### Terminal 1: Website
```bash
cd website
npm run dev
# Opens http://localhost:3000
```

### Terminal 2: PC Bridge
```bash
cd pc-bridge
npm run dev
# OR use: start.bat
# Running at http://localhost:3001
```

### Terminal 3: Extension
Already loaded from chrome://extensions

### Test Flow
1. Open http://localhost:3000 in Chrome
2. Click "Mulai Pairing"
3. Scan QR or enter code in extension
4. Upload photo
5. Click "Baca Surat"
6. Edit fields
7. Click "Kirim ke PC"
8. Extension should show data

---

## Part 8: Deploy to Vercel

### Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `scansurat-unkris`
3. Make it **Public** (required for free Vercel)
4. Click Create

### Push Code to GitHub

```bash
cd scansurat-unkris

# Initialize git
git init
git add .
git commit -m "Initial commit: ScanSurat UNKRIS v1.0"

# Add remote (copy URL from GitHub)
git remote add origin https://github.com/YOUR_USERNAME/scansurat-unkris.git

# Push to GitHub
git push -u origin main
```

### Deploy on Vercel

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Paste your repo URL
4. Click Import
5. Configure environment variables (add same as `.env.local`)
6. Click Deploy
7. Wait 2-3 minutes
8. Get production URL

### Update Chrome Extension

Edit `chrome-extension/popup.js`:
```javascript
const BRIDGE_URL = 'http://localhost:3001'  // Still local
const SUPABASE_URL = 'https://your-project.supabase.co'
```

The website URL is **NOT** hardcoded (it auto-detects from window.location)

---

## Part 9: Daily Usage

### To Run Everything

**Quick Start**:
1. Double-click `pc-bridge/start.bat` (opens bridge)
2. In another terminal:
   ```bash
   cd website
   npm run dev
   ```
3. Open http://localhost:3000 in Chrome
4. Extension already loaded

**With Production Website**:
1. Double-click `pc-bridge/start.bat`
2. Open https://your-project.vercel.app in Chrome
3. Same workflow

### Stop Everything
1. Press `Ctrl+C` in website terminal
2. Press `Ctrl+C` in PC Bridge window (or close window)

---

## Troubleshooting

### "Node.js not found"
- Reinstall Node.js from nodejs.org
- Make sure "Add to PATH" is checked
- Restart Command Prompt after install

### PC Bridge won't start
```
Error: EADDRINUSE: address already in use :::3001
```
**Solution**: Port 3001 already in use
```bash
# Kill process using port 3001
netstat -ano | findstr :3001
taskkill /pid YOUR_PID /f
```
Or use `stop.bat`

### Camera not working
- Check Windows permissions: Settings → Privacy & Security → Camera
- Allow Chrome to use camera
- Test in another app first

### Supabase connection error
- Verify `.env` file has correct keys
- Test connection:
  ```bash
  curl https://YOUR_PROJECT.supabase.co/rest/v1/
  ```

### Extension not showing in Chrome
- Check `chrome://extensions`
- Enable "Developer mode"
- Reload extension after code changes (Ctrl+R or reload button)

### Port 3000 or 3001 already in use
Find and kill processes:
```bash
# Find process on port
netstat -ano | findstr :3000
# Kill it
taskkill /pid PID_NUMBER /f
```

---

## Recommended Setup

### For Development
1. **Code Editor**: VS Code (https://code.visualstudio.com/)
   - Extensions: Prettier, ESLint, Tailwind CSS

2. **Git Client**: GitHub Desktop (optional)
   - Easier than command line for beginners

3. **Database Manager**: Supabase Dashboard
   - Monitor queries & data

### For Testing
1. **Chrome DevTools**: F12
   - Network tab to see API calls
   - Console for errors

2. **Device Testing**: Android phone with USB
   - Test camera on real device
   - Test performance

### For Deployment
1. **GitHub Desktop**: Push changes easily
2. **Vercel Dashboard**: Monitor deployments
3. **Supabase Dashboard**: Monitor database

---

## File Structure Reminder

```
C:\Users\{username}\Documents\scansurat-unkris\
├── website/              ← Next.js app (localhost:3000)
│   └── .env.local
├── pc-bridge/            ← Node.js server (localhost:3001)
│   ├── start.bat         ← Run this to start bridge
│   ├── stop.bat          ← Run this to stop bridge
│   └── .env
└── chrome-extension/     ← Load via chrome://extensions
```

---

## Common Tasks

### Update Dependencies
```bash
npm update
npm audit fix
```

### Reset Everything
```bash
# Clear all caches and reinstall
rm -r node_modules website/node_modules pc-bridge/node_modules
npm install
cd website && npm install
cd ../pc-bridge && npm install
```

### Deploy New Version
```bash
git add .
git commit -m "Update: description of changes"
git push origin main
# Vercel auto-deploys
```

### View PC Bridge Logs
Just look at the terminal output - logs print to console

### Debug Supabase Queries
Go to Supabase Dashboard → SQL Editor → run queries directly

---

## Security Reminders

⚠️ **IMPORTANT**:
- Never share `.env` files
- Never commit `.env` to Git
- `.env.local` and `.env` are in `.gitignore` ✓
- Service role keys should NEVER be in frontend code
- Only ANON key goes in NEXT_PUBLIC_* variables

---

## Support

- **Website Issues**: Check console (F12)
- **PC Bridge Issues**: Check terminal output
- **Extension Issues**: Check chrome://extensions → Details
- **Supabase Issues**: Go to Supabase Dashboard → Logs

For help:
- Check README files in each folder
- Review GitHub Issues
- Check browser console for errors

---

**Setup Complete!** You're ready to use ScanSurat UNKRIS.
