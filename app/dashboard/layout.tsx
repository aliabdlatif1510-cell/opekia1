"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, type ReactNode } from "react";
import { LayoutDashboard, Briefcase, Users, Home, Moon, Sun, LogOut, Sparkles } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const NAV = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/wishes", label: "نفسك في إيه؟", icon: Sparkles },
  { href: "/dashboard/family", label: "عائلتي", icon: Users },
  { href: "/dashboard/home", label: "بيتي", icon: Home },
  { href: "/dashboard/work", label: "شغلي", icon: Briefcase },
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

      // Check Supabase session first
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-navy-800 md:min-h-screen md:w-64 md:border-b-0 md:border-e">
        <div className="flex items-center gap-2 px-2 py-3 text-lg font-extrabold">
          <Sparkles className="text-emerald-500" size={22} />
          أوبكيا | Opekia
        </div>
        <nav className="mt-2 flex gap-2 overflow-x-auto md:flex-col">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/70 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-navy-900/70 md:px-8">
          <div className="text-sm">
            مرحباً، <span className="font-bold">{user.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="تبديل الوضع"
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-500/10"
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
