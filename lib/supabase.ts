import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tkmpqigzqsavspxknqxl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrbXBxaWd6cXNhdnNweGtucXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMTQ0ODksImV4cCI6MjEwODY5MDQ4OX0.c1Gg0gzS1DyQyaUAaHBxWbqAMWRqBXkWvzoDfOjOQj0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured = true;
