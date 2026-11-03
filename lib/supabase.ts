import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tkmpqigzqsavspxknqxl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ZQfbTLTymMJvHJZnMglH8w_eRlEAC8V'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured = true;
