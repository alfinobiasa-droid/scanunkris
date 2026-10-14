# Supabase Setup Guide - ScanSurat UNKRIS

## Prerequisites
- Supabase account (sign up at https://supabase.com)
- Project yang sudah dibuat
- Access ke Supabase dashboard

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `scansurat-unkris`
   - Database Password: (generate strong password)
   - Region: (pilih terdekat ke lokasi)
4. Click "Create new project"
5. Tunggu 3-5 menit hingga project selesai dibuat

## Step 2: Get API Keys

1. Go to Project Settings → API
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **JANGAN** share service_role key ke public/Git

## Step 3: Run SQL Migrations

1. Go to SQL Editor in Supabase dashboard
2. Click "New query"
3. Copy-paste semua isi dari `docs/supabase-migrations.sql`
4. Click "Run"
5. Tunggu hingga selesai (check untuk errors)

## Step 4: Configure Environment Variables

### Website (`website/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_PC_BRIDGE_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

### PC Bridge (`pc-bridge/.env`)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
BRIDGE_PORT=3001
BRIDGE_HOST=localhost
NODE_ENV=development
```

## Step 5: Verify RLS (Row Level Security)

1. Go to Authentication → Policies in Supabase
2. Check each table:
   - `pairing_sessions` ✓
   - `scan_data` ✓
   - `connection_status` ✓
   - `form_fill_results` ✓

Semua harus menunjukkan "RLS enabled"

## Step 6: Enable Realtime

1. Go to Database → Replication
2. Check "Enable realtime" untuk publikasi `supabase_realtime`
3. Verifikasi tabel-tabel berikut terdaftar:
   - `pairing_sessions`
   - `scan_data`
   - `connection_status`
   - `form_fill_results`

## Step 7: Test Connection

```bash
# Terminal 1: Website
cd website
npm run dev
# Should show no Supabase errors

# Terminal 2: PC Bridge
cd pc-bridge
npm run dev
# Should show "✓ Supabase connected"
```

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` atau `.env` file
- Pastikan format benar (copy dari dashboard)
- Jangan ada whitespace extra

### "RLS policy error"
- Go to Supabase dashboard
- Check Data → RLS Policies
- Verifikasi semua policies sudah dibuat
- Click "Review issues" untuk melihat error detail

### "Realtime not working"
- Go to Database → Replication
- Enable realtime publication
- Restart development server

### Koneksi timeout
- Check Supabase project status (di dashboard)
- Verifikasi region yang dipilih
- Coba ping: `curl https://your-project.supabase.co/rest/v1/`

## Security Notes

✓ **Do**: Keep service_role key secret, never commit ke Git
✓ **Do**: Use `.env.local` (in .gitignore)
✓ **Do**: Rotate keys secara berkala

✗ **Don't**: Hardcode keys di kode
✗ **Don't**: Share keys di Slack/email
✗ **Don't**: Push keys ke GitHub

## Backing Up

1. Go to Settings → Backups
2. Enable automatic backups
3. Download backups secara regular untuk safety

## Reset/Delete Project (Development Only)

Jika perlu reset:
1. Go to Settings → Delete Project
2. Type project name untuk konfirmasi
3. Project akan dihapus dalam beberapa jam

Atau untuk reset data saja:
```bash
# Via Supabase dashboard SQL Editor
DELETE FROM pairing_sessions;
DELETE FROM scan_data;
DELETE FROM connection_status;
DELETE FROM form_fill_results;
```

---

Setelah setup selesai, lanjut ke development atau deployment!
