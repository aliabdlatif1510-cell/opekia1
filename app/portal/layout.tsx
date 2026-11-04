"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense, type ReactNode } from "react";
import {
  Moon,
  Sun,
  LogOut,
  UserCheck,
  ShieldAlert,
  ArrowLeft,
  Headphones,
  FileCheck2,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchUserProfile,
  getLocalSession,
  saveLocalSession,
  clearLocalSession,
  type UserSession,
  type UserRole,
} from "@/lib/auth";

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      if (typeof window === "undefined") return;

      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            const role: UserRole = profile?.role || "client";
            const name = profile?.full_name || session.user.email?.split("@")[0] || "عميلنا العزيز";

            const sessionData: UserSession = {
              id: session.user.id,
              name,
              email: session.user.email || "",
              role,
              preview: false,
            };
            setUser(sessionData);
            saveLocalSession(sessionData);
          } else {
            const stored = getLocalSession();
            if (!stored) {
              router.replace("/");
              return;
            }
            setUser(stored);
          }
        } catch {
          const stored = getLocalSession();
          if (!stored) {
            router.replace("/");
            return;
          }
          setUser(stored);
        }
      } else {
        const stored = getLocalSession();
        if (!stored) {
          router.replace("/");
          return;
        }
        setUser(stored);
      }

      try {
        const isDark = localStorage.getItem("opekia_theme") !== "light";
        setDark(isDark);
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", isDark);
        }
      } catch {}
    };

    init();
  }, [router]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("opekia_theme", next ? "dark" : "light");
      } catch {}
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    clearLocalSession();
    router.replace("/");
  };

  if (!mounted || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="font-mono text-xs tracking-widest text-slate-500">OPEKIA CLIENT PORTAL</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-4">
            <Link href="/portal" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Opekia Logo"
                width={130}
                height={100}
                className="object-contain w-auto h-11 block dark:hidden"
              />
              <Image
                src="/logo-dark.png"
                alt="Opekia Logo"
                width={130}
                height={100}
                className="object-contain w-auto h-11 hidden dark:block"
              />
            </Link>

            <div className="h-5 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <UserCheck size={13} />
              <span>بوابة العميل | Client Portal</span>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {/* If Admin is viewing, show quick link back to dashboard */}
            {user.role === "admin" && (
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition hover:bg-emerald-500/20"
              >
                <ShieldAlert size={14} />
                <span>لوحة الإدارة</span>
                <ArrowLeft size={12} />
              </Link>
            )}

            <div className="hidden md:flex flex-col text-start">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="تبديل النمط"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">تسجيل خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/50 py-4 px-6 text-center text-xs text-slate-500 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>منصة أوبكيا الذكية — جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/contact" className="hover:text-emerald-500 transition">
              الدعم الفني والمساعدة
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
