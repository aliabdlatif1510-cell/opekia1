"use client";

import { useState, useEffect, Suspense, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type Session = { name: string; email: string; preview: boolean };

function LoginForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const enter = (session: Session) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("opekia_session", JSON.stringify(session));
      } catch (e) {
        console.error("Storage error:", e);
      }
    }
    router.push("/dashboard");
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
          console.log("Signup attempt:", { email });
          const { data, error: err } = await supabase.auth.signUp({ email, password });
          if (err) {
            console.error("Supabase Auth Error:", err);
            setError(err.message || "An unexpected error occurred");
            setLoading(false);
            return;
          }
          if (data.user && !data.session) {
            setError("تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق منه ثم تسجيل الدخول.");
            setLoading(false);
            return;
          }
          enter({ name: data.user?.email?.split("@")[0] ?? "مستخدم", email, preview: false });
        } else {
          console.log("Login attempt:", { email });
          const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
          if (err) {
            console.error("Supabase Auth Error:", err);
            setError(err.message || "An unexpected error occurred");
            setLoading(false);
            return;
          }
          enter({ name: data.user.email?.split("@")[0] ?? "مستخدم", email, preview: false });
        }
      } catch (err: any) {
        console.error("Supabase Auth Error:", err);
        setError(err?.message || "An unexpected error occurred");
        setLoading(false);
      }
      return;
    }

    // ---- Preview / localStorage fallback ----
    setTimeout(() => enter({ name: email.split("@")[0], email, preview: false }), 600);
  };

  const input =
    "w-full rounded-xl border border-white/15 bg-white/5 py-3 pe-10 ps-4 text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40";

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
        <div className="text-center">
          <div className="bg-white px-8 py-4 rounded-3xl shadow-2xl mx-auto inline-block mb-8">
            <Image 
              src="/logo.jpg" 
              alt="Opekia Logo" 
              width={250} 
              height={80} 
              className="object-contain" 
              priority 
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex rounded-xl bg-white/5 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  mode === m ? "bg-emerald-500 text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                {m === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className={input} />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className={input} />
            </div>

            {error && <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {mode === "login" ? "دخول" : "إنشاء الحساب"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-white/10" />
            أو
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => enter({ name: "مستخدم تجريبي", email: "preview@opekia.app", preview: true })}
            className="w-full rounded-xl border border-white/20 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            الدخول السريع (وضع المعاينة التجريبي)
          </button>
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
