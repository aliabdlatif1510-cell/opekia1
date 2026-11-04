import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = 'https://tkmpqigzqsavspxknqxl.supabase.co'
const supabaseAnonKey = 'sb_publishable_ZQfbTLTymMJVHJZnMgIH8w_eRlEAC8V'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured = true;
