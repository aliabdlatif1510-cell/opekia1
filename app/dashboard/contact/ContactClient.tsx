"use client";

import { useState } from "react";
import {
  MessageSquare,
  Mail,
  Send,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  Headphones,
  Globe,
  HelpCircle,
} from "lucide-react";

export default function ContactClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSubmitted(true);
    setToast("✨ تم استلام رسالتك بنجاح! سيتواصل معك فريق أوبكيا في أقرب وقت.");

    setName("");
    setEmail("");
    setMessage("");

    setTimeout(() => {
      setToast("");
    }, 4000);
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full overflow-hidden pb-16">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-24 start-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[130px] dark:bg-emerald-500/15" />
      <div className="pointer-events-none absolute bottom-10 end-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-[130px] dark:bg-blue-500/15" />

      {/* Hero Header */}
      <div className="relative z-10 mx-auto max-w-3xl text-center pt-6 sm:pt-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600 backdrop-blur-md dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
          <Headphones size={14} className="animate-pulse" />
          <span>مركز الدعم والتواصل المباشر</span>
        </div>

        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-blue-400">
            تواصل معنا
          </span>
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-slate-600 dark:text-slate-300 sm:text-base">
          نحن هنا لمساعدتك دائماً. سواء كان لديك استفسار، اقتراح تطوير، أو ترغب في بدء شراكة عمل،
          يسعدنا سماع صوتك.
        </p>
      </div>

      {/* Main Grid: Channels & Direct Message Form */}
      <div className="relative z-10 mx-auto mt-10 grid max-w-5xl gap-6 px-4 md:grid-cols-5">
        {/* Left Column: Direct Channels (2 cols) */}
        <div className="space-y-4 md:col-span-2">
          {/* Card 1: Email */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-navy-800/80">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Mail size={20} />
            </div>
            <h3 className="mt-4 text-base font-bold">البريد الإلكتروني المباشر</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              لفريق الدعم والاستفسارات العامة
            </p>
            <a
              href="mailto:support@opekia.com"
              className="mt-3 inline-block font-mono text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              support@opekia.com
            </a>
          </div>

          {/* Card 2: Partnerships */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-navy-800/80">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <Sparkles size={20} />
            </div>
            <h3 className="mt-4 text-base font-bold">الشراكات والأعمال</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              للفرص التجارية والتعاون الاستراتيجي
            </p>
            <a
              href="mailto:partners@opekia.com"
              className="mt-3 inline-block font-mono text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              partners@opekia.com
            </a>
          </div>

          {/* Card 3: Response Time */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-navy-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold">سرعة الاستجابة</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  فريقنا متواجد ومتاح للرد خلال أقل من ٢٤ ساعة عمل.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form (3 cols) */}
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-navy-800/80 sm:p-8 md:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-emerald-500" size={20} />
              <h2 className="text-lg font-black">أرسل لنا رسالة مباشرة</h2>
            </div>
            <span className="text-xs text-slate-400">خط مباشر</span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  الاسم الكامل *
                </span>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-navy-900/90 dark:focus:bg-navy-900"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  البريد الإلكتروني *
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-navy-900/90 dark:focus:bg-navy-900"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                نوع الاستفسار
              </span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-navy-900/90 dark:focus:bg-navy-900"
              >
                <option value="general">استفسار عام عن المنصة</option>
                <option value="support">مساعدة أو دعم فني</option>
                <option value="partnership">اقتراح شراكة أعمال</option>
                <option value="feature">اقتراح ميزة جديدة</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                تفاصيل الرسالة *
              </span>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك أو استفسارك هنا بكل وضوح..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-navy-900/90 dark:focus:bg-navy-900"
              />
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Send size={16} className="rtl:rotate-180" />
              <span>إرسال الرسالة الآن</span>
            </button>
          </form>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 start-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-900/95 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-md dark:bg-emerald-600">
          {toast}
        </div>
      )}
    </div>
  );
}
