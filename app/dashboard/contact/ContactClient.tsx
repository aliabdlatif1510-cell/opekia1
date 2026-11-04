"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function ContactClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 600);
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center py-10 px-4">
      {/* Centered Executive Card */}
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white/90 p-7 shadow-2xl backdrop-blur-xl transition dark:border-white/10 dark:bg-navy-900/90 sm:p-10">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            تواصل معنا
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            يسعدنا دائماً تلقي رسائلك وملاحظاتك المباشرة
          </p>
        </div>

        {submitted ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/15">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
            <h3 className="mt-3 text-base font-bold text-emerald-800 dark:text-emerald-300">
              تم إرسال رسالتك بنجاح
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              شكراً لتواصلك معنا، سنقوم بالرد عليك عبر البريد الإلكتروني في أقرب وقت.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
            >
              إرسال رسالة أخرى
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* الاسم */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                الاسم
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسمك الكامل"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-navy-800/80 dark:text-white dark:placeholder-slate-500 dark:focus:bg-navy-800"
              />
            </div>

            {/* البريد الإلكتروني */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                البريد الإلكتروني
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-navy-800/80 dark:text-white dark:placeholder-slate-500 dark:focus:bg-navy-800"
              />
            </div>

            {/* تفاصيل الرسالة */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                تفاصيل الرسالة
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب تفاصيل رسالتك أو استفسارك هنا..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-navy-800/80 dark:text-white dark:placeholder-slate-500 dark:focus:bg-navy-800"
              />
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Send size={16} className="rtl:rotate-180" />
              <span>{loading ? "جاري الإرسال..." : "إرسال الرسالة"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
