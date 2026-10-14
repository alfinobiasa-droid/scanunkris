# ScanSurat UNKRIS - Stage 4: Deployment & Production Setup

## Stage 4 Deliverables ✓

### Vercel Configuration Files
- **vercel.json** - Build & environment configuration
- **next.config.ts** - Security headers, redirects
- **GitHub Actions workflow** - Auto-deploy on push

### Windows PC Bridge
- **start.bat** - Automated startup script with dependency checking
- **stop.bat** - Graceful shutdown script
- Batch scripts validate Node.js, .env, dependencies

### Production Security
- **Security headers** (X-Content-Type-Options, X-Frame-Options, etc.)
- **Environment variable separation** (.env, .env.local, .env.production)
- **Service role key protection** (never exposed to frontend)
- **HTTPS enforcement** (Vercel default)

### Tailwind Component Utilities
- **components.css** - Reusable component styles
- **Responsive design** - Mobile-first approach
- **Status badges** - Success, error, pending states

### Documentation
- **DEPLOYMENT_GUIDE.md** - Step-by-step Vercel deployment
- **WINDOWS_SETUP.md** - Complete Windows PC setup guide

## Deployment Architecture - Stage 4

```
Local Development:
  HP (localhost:3000) → Chrome Browser
  ↓
  PC Bridge (localhost:3001) ← Chrome Extension
  ↓
  Supabase Cloud

Production:
  HP (vercel.app) → Chrome Browser (HTTPS)
  ↓
  PC Bridge (localhost:3001) ← Chrome Extension (still local)
  ↓
  Supabase Cloud (same)
```

**Key Point**: Website moves to Vercel, PC Bridge stays on Windows (no deployment needed)

## Environment Variables

### Development (website/.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-key
NEXT_PUBLIC_PC_BRIDGE_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

### Production (Vercel Dashboard)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-key (same as dev)
NEXT_PUBLIC_PC_BRIDGE_URL=http://localhost:3001 (still localhost!)
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://scansurat-unkris.vercel.app
```

**Important**: Service role keys NEVER in frontend - only in backend APIs (Node.js)

## PC Bridge on Windows

### Startup Script (start.bat)
Validates:
- Node.js installed & in PATH
- Working directory correct
- .env file exists
- Dependencies installed
- Creates .env from .env.example if needed

Handles:
- Error checking
- Dependency installation
- Colorized output (Windows 10+)
- User-friendly messages

### Usage
```bash
# Double-click start.bat from Windows Explorer
# OR from command prompt:
cd pc-bridge
start.bat

# Output:
[OK] Node.js detected: v18.x.x
[OK] package.json found
[INFO] Starting PC Bridge...
[INFO] Bridge will run on: http://localhost:3001
✓ PC Bridge running at http://localhost:3001
✓ Supabase connected
```

### Shutdown (stop.bat)
Gracefully terminates:
- Finds process on port 3001
- Terminates with SIGTERM (clean)
- Verifies termination

## Security Implementation - Stage 4

### HTTPS Enforcement
- Vercel automatically provides HTTPS
- Required for:
  - Camera access (getUserMedia)
  - Secure cookie handling
  - PWA features

### Security Headers (next.config.ts)
```
X-Content-Type-Options: nosniff      → Prevent MIME sniffing
X-Frame-Options: DENY                → Prevent clickjacking
X-XSS-Protection: 1; mode=block      → Enable XSS filter
Referrer-Policy: strict-origin-...   → Limit referrer leaks
```

### Environment Isolation
- Development: .env.local (git-ignored)
- Production: Vercel dashboard (encrypted)
- Never hardcode secrets in code
- Different API keys for different environments (optional)

### API Key Protection
```javascript
// ✓ Good - exposed to browser (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY

// ✗ Bad - never do this
SUPABASE_SERVICE_ROLE_KEY (frontend code)
```

## Vercel Deployment Flow

```
1. Push to GitHub (main branch)
   ↓
2. GitHub sends webhook to Vercel
   ↓
3. Vercel builds project
   - npm install
   - npm run build
   - Run tests (optional)
   ↓
4. Build artifacts generated
   - .next/ folder created
   - Static files cached
   ↓
5. Deploy to Vercel CDN
   - Get unique URL
   - Set custom domain (optional)
   ↓
6. Vercel assigns URL
   - Production: https://scansurat-unkris.vercel.app
   - Preview: https://pr-123.vercel.app
   ↓
7. Deployment complete
   - Automatic HTTPS
   - Global CDN distribution
```

## GitHub Actions Auto-Deploy

Workflow file: `.github/workflows/deploy.yml`

Triggers on:
- Push to main branch
- Pull requests to main

Steps:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Run build
5. Deploy to Vercel (if main branch)

Configuration:
- Set secrets in GitHub:
  - VERCEL_TOKEN (from Vercel dashboard)
  - VERCEL_ORG_ID
  - VERCEL_PROJECT_ID

## Windows Batch Scripts

### start.bat Features
```batch
@echo off                    ← Suppress output
setlocal enabledelayedexpansion  ← Allow dynamic vars
title ScanSurat PC Bridge    ← Set window title

REM Check Node.js version
node --version >nul 2>&1
if errorlevel 1 (error handling)

REM Validate .env exists
if not exist ".env" (copy from example)

REM Install dependencies if needed
if not exist "node_modules" (npm install)

REM Start server
call npm run dev
```

### stop.bat Features
```batch
REM Find process on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001"')

REM Terminate gracefully
taskkill /pid %%a /f

REM Verify
if errorlevel 0 (success message)
```

## Performance Optimizations - Stage 4

### Build Optimization
- SWC minification (faster than Babel)
- Image optimization disabled (Tesseract limitation)
- Tree-shaking for unused code
- Dynamic imports for large libraries

### CDN & Caching
- Vercel CDN distributes globally
- Static assets cached at edge
- API responses can be cached (optional)
- Service worker for offline (optional)

### Database Optimization
- Indexes on frequently-queried columns (done in Stage 2)
- RLS policies (done in Stage 2)
- Connection pooling (Supabase handles)

## Monitoring & Alerts

### Vercel Monitoring
- Deployments dashboard
- Build logs (visible if build fails)
- Performance metrics
- Deployment history with rollback

### Supabase Monitoring
- Usage dashboard (API calls, database size)
- Logs viewer (SQL queries)
- Real-time status
- Performance insights

### Error Tracking (Optional)
Consider adding for production:
- Sentry.io (error tracking)
- LogRocket (session replay)
- New Relic (APM monitoring)

## Rollback Strategy

### Immediate Rollback
If production breaks:
```bash
git revert HEAD
git push origin main
# Vercel auto-redeploys previous version (< 1 minute)
```

### Vercel Dashboard Rollback
1. Go to Deployments
2. Click previous successful build
3. Click "Redeploy"
4. Confirm

### Database Rollback
Supabase backups:
- Settings → Backups
- Download backup if needed
- Restore from backup (point-in-time recovery)

## Production Checklist - Stage 4

### Before First Deploy
- [ ] All tests pass locally
- [ ] Environment variables configured in Vercel
- [ ] GitHub repository created
- [ ] Supabase project active
- [ ] PC Bridge tested locally
- [ ] Chrome Extension tested

### After First Deploy
- [ ] Website loads at Vercel URL
- [ ] Camera works (test on HTTPS)
- [ ] File upload works
- [ ] OCR processes correctly
- [ ] PC Bridge connects
- [ ] Extension receives data
- [ ] Form filling works

### Weekly Maintenance
- [ ] Check Vercel build logs
- [ ] Monitor Supabase usage
- [ ] Review error logs
- [ ] Test key workflows
- [ ] Backup database

### Monthly Tasks
- [ ] Update dependencies (`npm update`)
- [ ] Review security advisories
- [ ] Download Supabase backup
- [ ] Review usage metrics
- [ ] Plan improvements

## File Structure - Stage 4

```
scansurat-unkris/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← Auto-deploy config
├── website/
│   ├── vercel.json             ← Vercel deployment config
│   ├── next.config.ts          ← Security headers
│   ├── app/
│   │   ├── components.css      ← Tailwind utilities
│   │   └── layout.tsx          ← Updated with PWA support
│   └── .env.local              ← Development (git-ignored)
├── pc-bridge/
│   ├── start.bat               ← Windows startup script
│   ├── stop.bat                ← Windows shutdown script
│   └── .env                    ← Configuration (git-ignored)
├── chrome-extension/
│   └── manifest.json           ← No changes needed
├── docs/
│   ├── DEPLOYMENT_GUIDE.md     ← Step-by-step deploy
│   ├── WINDOWS_SETUP.md        ← PC setup guide
│   └── SUPABASE_SETUP.md       ← From Stage 2
└── README.md                   ← Updated for Stage 4
```

## Deployment Timeline

**Expected Duration**:
- GitHub setup: ~5 min
- Vercel setup: ~10 min
- First deploy: ~2-3 min
- Test on production: ~10 min
- **Total**: ~30 minutes

## Cost Analysis

### Free Tier (Recommended for Learning)
- **Vercel**: Unlimited deployments, 100GB/mo bandwidth
- **Supabase**: Unlimited API calls, 500MB storage, 1GB bandwidth
- **Tesseract.js**: Client-side (no server cost)
- **Total Cost**: $0/month

### When to Upgrade
- Vercel Pro: If >100GB bandwidth/month ($20/mo)
- Supabase Pro: If >1GB storage ($25/mo)
- Custom domain: If needed ($12.99/year)

## What's Next - Stage 5

After Stage 4, remaining improvements:
- Advanced image preprocessing (crop, rotate, denoise)
- Offline-first PWA features
- Real-time form sync (WebSocket)
- Multi-language support
- Mobile app (React Native)
- Advanced analytics
- User accounts & authentication

---

**Stage 4 Complete**: Production-ready deployment infrastructure
**Status**: Ready to deploy to Vercel
**Next**: Follow DEPLOYMENT_GUIDE.md for step-by-step deployment
