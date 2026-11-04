import { supabase, isSupabaseConfigured } from "./supabase";

export type UserRole = "admin" | "client";

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface UserSession {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  preview: boolean;
}

export const SESSION_STORAGE_KEY = "opekia_session";

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Error fetching user profile:", error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      full_name: data.full_name,
      email: data.email,
      role: (data.role as UserRole) || "client",
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.warn("Failed to get profile:", err);
    return null;
  }
}

export function getLocalSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLocalSession(session: UserSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error("Error saving session:", err);
  }
}

export function clearLocalSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}
