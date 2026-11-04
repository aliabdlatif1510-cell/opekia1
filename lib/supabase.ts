import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tkmpqigzqsavspxknqxl.supabase.co";
const rawKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ZQfbTLTymMJvHJZnMglH8w_eRlEAC8V";

// Strictly format: remove leading/trailing whitespace and any trailing slash
const supabaseUrl = rawUrl.trim().replace(/\/+$/, "");
const supabaseAnonKey = rawKey.trim();

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a lazy Supabase client instance (singleton).
 * Avoids instantiating auth listeners and storage handlers at the module's top level.
 */
export function getSupabase(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: typeof window !== "undefined",
        detectSessionInUrl: typeof window !== "undefined",
      },
    });
  }
  return cachedClient;
}

/**
 * Proxy object for drop-in compatibility with `supabase.auth...` and `supabase.from(...)`.
 * Only calls getSupabase() when a property or method is actually invoked.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});

export const isSupabaseConfigured = true;
