import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tkmpqigzqsavspxknqxl.supabase.co'
const supabaseKey = 'sb_publishable_ZQfbTLTymMJVHJZnMgIH8w_eRlEAC8V'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      apikey: supabaseKey,
    },
  },
  auth: {
    persistSession: false, // Prevents stale token issues
  }
})
export const isSupabaseConfigured = true;
