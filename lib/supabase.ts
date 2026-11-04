import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tkmpqigzqsavspxknqxl.supabase.co'
const supabaseAnonKey = 'sb_publishable_ZQfbTLTymMJVHJZnMgIH8w_eRlEAC8V'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured = true;
