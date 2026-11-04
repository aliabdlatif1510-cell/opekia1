"use client";

import { useState, useEffect, Suspense, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchUserProfile,
  saveLocalSession,
  getLocalSession,
  type UserSession,
  type UserRole,
} from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);

    const checkExistingSession = async () => {
      if (typeof window === "undefined") return;

      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            const role: UserRole = profile?.role || "client";
            const name = profile?.full_name || session.user.email?.split("@")[0] || "مستخدم";

            saveLocalSession({
              id: session.user.id,
              name,
              email: session.user.email || "",
              role,
              preview: false,
            });

            if (role === "admin") {
              router.replace("/dashboard");
            } else {
              router.replace("/portal");
            }
            return;
          }
        } catch (e) {
          console.warn("Session check error:", e);
        }
      }

      // Check stored session
      const stored = getLocalSession();
      if (stored && !stored.preview) {
        if (stored.role === "admin") {
          router.replace("/dashboard");
        } else {
          router.replace("/portal");
        }
      }
    };

    checkExistingSession();
  }, [router]);

  const redirectByRole = (session: UserSession) => {
    saveLocalSession(session);
    if (session.role === "admin") {
      router.push("/dashboard");
    } else {
      router.push("/portal");
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@") || password.length < 6) {
      setError("أدخل بريداً إلكترونياً صحيحاً وكلمة مرور لا تقل عن 6 أحرف");
      return;
    }
    setLoading(true);

    // ---- Supabase Auth ----
    if (isSupabaseConfigured) {
      try {
        if (mode === "signup") {
          const { data, error: err } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName.trim() || email.split("@")[0],
              },
            },
          });

          if (err) {
            console.error("Supabase Auth Error:", err);
            setError(err.message || "حدث خطأ أثناء إنشاء الحساب");
            setLoading(false);
            return;
          }

          if (data.user && !data.session) {
            setError("تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق منه ثم تسجيل الدخول.");
            setLoading(false);
            return;
          }

          if (data.user) {
            // New signups default to 'client' role
            const profile = await fetchUserProfile(data.user.id);
            const role: UserRole = profile?.role || "client";
            redirectByRole({
              id: data.user.id,
              name: fullName || data.user.email?.split("@")[0] || "مستخدم جديد",
              email,
              role,
              preview: false,
            });
          }
        } else {
          // Login
          const { data, error: err } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (err) {
            console.error("Supabase Auth Error:", err);
            setError(err.message === "Invalid login credentials"
              ? "بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور"
              : err.message || "حدث خطأ أثناء تسجيل الدخول");
            setLoading(false);
            return;
          }

          if (data.user) {
            // Fetch user profile and determine role (admin vs client)
            const profile = await fetchUserProfile(data.user.id);
            const role: UserRole = profile?.role || "client";
            const name = profile?.full_name || data.user.email?.split("@")[0] || "مستخدم";

            redirectByRole({
              id: data.user.id,
              name,
              email,
              role,
              preview: false,
            });
          }
        }
      } catch (err: any) {
        console.error("Supabase Auth Error:", err);
        setError(err?.message || "حدث خطأ غير متوقع");
        setLoading(false);
      }
      return;
    }

    // ---- Preview / localStorage fallback ----
    setTimeout(() => {
      redirectByRole({
        name: email.split("@")[0],
        email,
        role: "admin",
        preview: true,
      });
    }, 600);
  };

  const input =
    "w-full rounded-xl border border-white/15 bg-white/5 py-3 pe-10 ps-4 text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40 text-sm";

  if (!mounted) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-4">
      <div className="pointer-events-none absolute -top-32 -start-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -end-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Image 
            src="/logo-dark.png" 
            alt="Opekia Logo" 
            width={280} 
            height={210} 
            className="object-contain mx-auto drop-shadow-2xl transition-transform duration-300 hover:scale-105" 
            priority 
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex rounded-xl bg-white/5 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  mode === m ? "bg-emerald-500 text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                {m === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="الاسم الكامل"
                  className={input}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className={input}
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className={input}
              />
            </div>

            {error && <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-60 text-sm"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {mode === "login" ? "دخول" : "إنشاء الحساب"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-white/10" />
            أو المعاينة السريعة
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => redirectByRole({
                name: "مدير النظام (تجريبي)",
                email: "admin@opekia.app",
                role: "admin",
                preview: true,
              })}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 py-2.5 px-3 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-emerald-400"
            >
              <ShieldCheck size={14} className="text-emerald-400" />
              لوحة الإدارة (Admin)
            </button>

            <button
              type="button"
              onClick={() => redirectByRole({
                name: "عميل تجريبي",
                email: "client@opekia.app",
                role: "client",
                preview: true,
              })}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 py-2.5 px-3 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-blue-400"
            >
              <UserCheck size={14} className="text-blue-400" />
              بوابة العميل (Client)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginClient() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
