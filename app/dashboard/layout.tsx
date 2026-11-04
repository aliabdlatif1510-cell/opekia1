"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, type ReactNode } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Home,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  Command,
  CircleDot,
  Headphones,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const NAV = [
  { href: "/dashboard", label: "الرئيسية", code: "00", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/wishes", label: "نفسك في إيه؟", code: "AI", icon: Sparkles },
  { href: "/dashboard/contact", label: "تواصل معنا", code: "01", icon: Headphones },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      if (typeof window === "undefined") return;

      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const name = session.user.email?.split("@")[0] ?? "مستخدم";
            setUser({ name });
            localStorage.setItem("opekia_session", JSON.stringify({ name, email: session.user.email, preview: false }));
          } else {
            const raw = localStorage.getItem("opekia_session");
            if (!raw) { router.replace("/"); return; }
            setUser(JSON.parse(raw));
          }
        } catch {
          const raw = localStorage.getItem("opekia_session");
          if (!raw) { router.replace("/"); return; }
          setUser(JSON.parse(raw));
        }
      } else {
        const raw = localStorage.getItem("opekia_session");
        if (!raw) { router.replace("/"); return; }
        setUser(JSON.parse(raw));
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
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("opekia_session");
      } catch {}
    }
    router.replace("/");
  };

  if (!mounted || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="font-mono text-xs tracking-widest text-slate-500">OPEKIA</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 md:flex-row">
      {/* Sidebar */}
      <aside className="border-b border-slate-200/80 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/80 md:min-h-screen md:w-64 md:border-b-0 md:border-e">
        {/* Brand Monogram */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 dark:border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Command size={18} />
              <span className="absolute -top-0.5 -end-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>
            <div>
              <span className="block text-base font-black tracking-tight">أوبكيا</span>
              <span className="block font-mono text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                INTELLIGENT OS
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="mt-5 flex gap-1.5 overflow-x-auto md:flex-col">
          {NAV.map(({ href, label, code, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center justify-between whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                  active
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white/[0.08] dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.03] dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={16}
                    className={`transition-colors ${
                      active
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                    }`}
                  />
                  <span>{label}</span>
                </div>
                <span
                  className={`font-mono text-[9px] tracking-wider transition-opacity ${
                    active ? "opacity-100 text-slate-400" : "opacity-40 group-hover:opacity-75"
                  }`}
                >
                  {code}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main View Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Minimalist Executive Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/70 px-6 py-3.5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 md:px-10">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <div className="text-xs text-slate-600 dark:text-slate-400">
              جلسة العمل: <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
            </div>
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
