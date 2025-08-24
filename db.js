// db.js
import { createClient } from '@supabase/supabase-js'

// pakai URL & KEY dari Supabase Project
const supabaseUrl = 'https://jiujogorhfadkuniedvs.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // simpan di Vercel env

export const supabase = createClient(supabaseUrl, supabaseKey)
