import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

// Service role client (admin access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// Regular client
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
if (!supabaseAnonKey) {
  throw new Error('Missing Supabase ANON key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
