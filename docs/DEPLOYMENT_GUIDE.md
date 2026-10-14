# ScanSurat UNKRIS - Deployment Guide (Stage 4)

## Quick Start - Deploy to Vercel

### Prerequisites
- GitHub account (for repo)
- Vercel account (free tier available at vercel.com)
- Supabase project (created in Stage 2)
- Chrome Extension ready to install

### Step 1: Push to GitHub

```bash
cd scansurat-unkris

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: ScanSurat UNKRIS full-stack app"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/scansurat-unkris.git
git push -u origin main
```

### Step 2: Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Connect your GitHub account
5. Select `scansurat-unkris` repository
6. Click "Import"

### Step 3: Configure Environment Variables

In Vercel dashboard, go to Settings → Environment Variables:

Add these variables:
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key-here (optional for production)
NEXT_PUBLIC_PC_BRIDGE_URL = http://localhost:3001
NEXT_PUBLIC_APP_ENV = production
NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
```

⚠️ **Important**: 
- Never share SUPABASE_SERVICE_ROLE_KEY publicly
- Use separate Supabase keys for production if possible
- PC_BRIDGE_URL stays as localhost (Chrome Extension runs locally)

### Step 4: Deploy

1. Vercel will automatically start building after you add variables
2. Wait for deployment to complete (~2-3 minutes)
3. You'll get a URL like `https://scansurat-unkris.vercel.app`
4. Click "Visit" to test the website

## Production Checklist

### Security
- [ ] Supabase RLS policies enabled (check Stage 2)
- [ ] Service role key NOT in frontend code
- [ ] HTTPS enforced (Vercel handles this)
- [ ] Security headers configured (next.config.ts)
- [ ] No secrets in .env.example
- [ ] git check: verify no .env files committed

### Performance
- [ ] Test OCR performance (check Tesseract loading)
- [ ] Test camera/file upload on mobile
- [ ] Verify Supabase queries are optimized
- [ ] Check Network tab for large asset sizes

### Functionality
- [ ] QR pairing works end-to-end
- [ ] OCR processes correctly
- [ ] Scan data saves to Supabase
- [ ] PC Bridge polling works
- [ ] Chrome Extension receives data
- [ ] Form filling works on portal

### Mobile Testing
- [ ] Test on Android (Chrome)
- [ ] Test on iOS (Safari)
- [ ] Test camera permissions
- [ ] Test offline scenario
- [ ] Test with poor connection

### Monitoring
- [ ] Setup error logging (Sentry optional)
- [ ] Monitor Supabase usage
- [ ] Check Vercel build logs for issues
- [ ] Monitor Supabase API calls

## Production Environment Setup

### Separate Production Supabase

For maximum security, create separate Supabase projects:

**Development** (current):
- For local testing
- Less strict RLS

**Production**:
- Separate database
- Stricter RLS policies
- Different API keys
- Regular backups

Switch between environments using different .env files:
```bash
# Local development
cp .env.development .env.local

# Production deployment
# Set NEXT_PUBLIC_APP_ENV=production in Vercel
```

## Monitoring & Debugging

### View Vercel Logs
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View real-time logs
vercel logs
```

### View Supabase Logs
1. Go to Supabase dashboard
2. Navigate to Logs section
3. Filter by query type
4. Check for errors or slow queries

### Monitor Performance
- Vercel Analytics: https://vercel.com/docs/analytics
- Supabase Usage: Project Settings → Usage
- Chrome DevTools: Performance tab

## Troubleshooting Deployment

### Build Fails
```
Error: Cannot find module 'tesseract.js'
```
**Solution**: 
```bash
cd website
npm install tesseract.js
git push origin main
```

### Camera Not Working
- **Cause**: HTTP instead of HTTPS
- **Fix**: Vercel uses HTTPS by default ✓

### Supabase Connection Error
- Check environment variables in Vercel dashboard
- Verify SUPABASE_URL format (should be full URL)
- Test with: `curl $SUPABASE_URL/rest/v1/`

### PC Bridge Not Connecting
- Ensure PC Bridge is running locally
- Check firewall allows localhost:3001
- Verify NEXT_PUBLIC_PC_BRIDGE_URL is correct

### OCR Slow on Mobile
- First run downloads ~40MB model (normal)
- Subsequent runs faster (cached)
- Consider adding loading indicator (already done)
- Verify network speed: Run speed test

## Running PC Bridge with Production Website

```bash
# PC Bridge still runs locally on Windows
cd pc-bridge

# Edit .env with production Supabase keys if desired
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-production-key

# Start bridge
npm run dev
# OR use batch script:
start.bat

# Should show:
# ✓ PC Bridge running at http://localhost:3001
# ✓ Supabase connected
```

## Continuous Deployment

### Automatic Deploys
- Push to `main` branch → Vercel auto-deploys
- GitHub Actions workflow (`.github/workflows/deploy.yml`) can add checks
- Set production branch in Vercel dashboard

### Environment-Specific Deployments
1. **Preview**: Push to `develop` branch
2. **Production**: Push to `main` branch

Configure in Vercel:
- Settings → Git → Production Branch → `main`
- Automatically generated preview URLs for PRs

## Rollback

If deployment breaks:

1. **Revert commit**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Vercel will auto-redeploy** previous version

3. **Or manually redeploy** from Vercel dashboard:
   - Deployments → Select previous build → click "Redeploy"

## Domain Setup (Optional)

To use custom domain like `scansurat.yourdomain.com`:

1. Go to Vercel dashboard
2. Project Settings → Domains
3. Add your domain
4. Update DNS records (follow Vercel instructions)
5. Wait for DNS propagation (~5-30 minutes)

## Scaling Considerations

### Free Tier Limits
- Vercel: Unlimited deployments, 100GB bandwidth/month
- Supabase: Unlimited API calls (but rate limited)
- Tesseract: Client-side (no server costs)

### When to Upgrade
- If OCR crashes on high load: Use Vercel Pro
- If Supabase queries slow: Upgrade database
- If API rate-limited: Use Supabase Pro

## Support & Monitoring

### Vercel Support
- https://vercel.com/support
- Build logs in dashboard
- Email alerts for deployment issues

### Supabase Support
- https://supabase.help
- Discord community: https://discord.supabase.com
- Dashboard status page

### Debug Mode

Enable debug logging:
```bash
# website/.env.local
NEXT_PUBLIC_DEBUG=true
DEBUG=*
```

View in browser console:
- F12 → Console tab
- Check for errors
- Verify network requests (Network tab)

## Production Best Practices

1. **Regular Backups**
   - Supabase: Enable automatic backups
   - Database: Download backups monthly

2. **Monitor Usage**
   - Check Supabase metrics weekly
   - Watch for unusual spikes
   - Scale proactively

3. **Security Updates**
   - Keep dependencies updated
   - Review Supabase advisories
   - Rotate keys regularly

4. **Testing**
   - Test before pushing to production
   - Use staging environment for major changes
   - Document deployment steps

5. **Documentation**
   - Keep README updated
   - Document any custom configurations
   - Maintain runbooks for common issues

## Cleanup & Optimization

### Remove Development Files
```bash
# Before deploying, cleanup
rm -rf node_modules/.cache
npm prune --production
```

### Optimize Bundle
- Vercel Analytics shows bundle size
- Remove unused dependencies
- Code-split large libraries

### Cache Configuration
- Images cached by CDN
- Static pages cached
- API responses cached where possible

---

## Next Steps

1. ✓ Push code to GitHub
2. ✓ Create Vercel project
3. ✓ Set environment variables
4. ✓ Deploy website
5. ✓ Test production URL
6. → Install Chrome Extension
7. → Run PC Bridge locally
8. → Test full flow with production URL

---

**Deployment Status**: Ready for production
**Website URL**: https://your-project.vercel.app (after deployment)
**PC Bridge**: Still runs on localhost (no deployment needed)
**Chrome Extension**: Install from chrome-extension/ folder
