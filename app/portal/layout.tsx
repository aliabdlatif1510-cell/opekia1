"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, type ReactNode } from "react";
import {
  LayoutDashboard,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  Headphones,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  ChevronLeft,
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

const NAV = [
  { href: "/portal", label: "الرئيسية (التوصيات والفرص)", code: "00", icon: LayoutDashboard, exact: true },
  { href: "/portal/contact", label: "تواصل معنا", code: "01", icon: Headphones },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="font-mono text-xs tracking-widest text-slate-500">OPEKIA CLIENT PORTAL</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:flex-row">
      {/* Executive Sidebar for Client */}
      <aside className="w-full shrink-0 border-b border-slate-200/80 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 md:w-72 md:border-b-0 md:border-e">
        {/* Brand Header with Official Logo */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/[0.06]">
          <Link href="/portal" className="group flex items-center">
            {/* Light Mode Logo */}
            <Image
              src="/logo.png"
              alt="Opekia Logo"
              width={160}
              height={120}
              className="object-contain w-auto h-14 block dark:hidden transition-transform duration-300 group-hover:scale-105"
            />
            {/* Dark Mode Logo */}
            <Image
              src="/logo-dark.png"
              alt="Opekia Logo"
              width={160}
              height={120}
              className="object-contain w-auto h-14 hidden dark:block transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Client Badge */}
          <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <UserCheck size={12} />
            عميل
          </span>
        </div>

        {/* Navigation items */}
        <nav className="mt-5 flex gap-1.5 overflow-x-auto md:flex-col">
          {NAV.map(({ href, label, code, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-blue-500/10 text-blue-600 shadow-sm dark:bg-blue-400/15 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={16}
                    className={
                      active
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 transition group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-white"
                    }
                  />
                  <span>{label}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300">
                  {code}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* The Two Distinct Boxes in Sidebar: 1. التوصيات | 2. الفرص */}
        <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-white/[0.06] space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            أقسام بوابة العميل
          </div>

          {/* 1. خانة التوصيات */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 p-3.5 shadow-sm transition hover:border-blue-500/35">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm shadow-blue-500/30">
                  <Sparkles size={15} />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">التوصيات</span>
              </div>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">مخصصة</span>
            </div>
            <Link
              href="/portal"
              className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-2 px-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              <span>عرض التوصيات</span>
              <ChevronLeft size={13} />
            </Link>
          </div>

          {/* 2. خانة الفرص */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/10 p-3.5 shadow-sm transition hover:border-amber-500/35">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm shadow-amber-500/30">
                  <TrendingUp size={15} />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">الفرص</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">متاحة</span>
            </div>
            <Link
              href="/portal"
              className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-2 px-3 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              <span>عرض الفرص</span>
              <ChevronLeft size={13} />
            </Link>
          </div>
        </div>

        {/* Admin Back Link (if Admin is previewing client portal) */}
        {user.role === "admin" && (
          <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/[0.06]">
            <Link
              href="/dashboard"
              className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition hover:bg-emerald-500/20"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} />
                <span>العودة للوحة الإدارة</span>
              </div>
              <ArrowLeft size={12} />
            </Link>
          </div>
        )}
      </aside>

      {/* Main View Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Minimalist Executive Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/70 px-6 py-3.5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 md:px-10">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-blue-500" />
            <div className="text-xs text-slate-600 dark:text-slate-400">
              جلسة العميل: <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
            </div>
            <span className="hidden sm:inline-flex rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
              بوابة العميل
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="تبديل النمط"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400"
            >
              <LogOut size={13} />
              <span>خروج</span>
            </button>
          </div>
        </header>

        {/* Content canvas */}
        <main className="flex-1 p-4 md:p-8">
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
