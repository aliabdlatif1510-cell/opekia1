"use client";

import Link from "next/link";
import { Users, Home, Briefcase, ChevronLeft, Sparkles, ArrowDown } from "lucide-react";

export default function DashboardClient() {
  const hubs = [
    {
      id: "family",
      number: "1",
      title: "عائلتي",
      subtitle: "المناسبات، الأجندة والوثائق",
      href: "/dashboard/family",
      icon: Users,
      accent: {
        glow: "group-hover:shadow-[0_0_60px_-10px_rgba(236,72,153,0.4)]",
        border: "border-pink-500/25 hover:border-pink-500/60 dark:border-pink-500/30",
        badge: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
        iconBg: "from-pink-500 to-rose-600 text-white shadow-pink-500/30",
        text: "text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400",
        gradient: "from-pink-500/5 via-rose-500/[0.02] to-transparent",
        numberBadge: "bg-pink-500 text-white",
      },
    },
    {
      id: "home",
      number: "2",
      title: "بيتي",
      subtitle: "المصروفات، الفواتير والصيانة",
      href: "/dashboard/home",
      icon: Home,
      accent: {
        glow: "group-hover:shadow-[0_0_60px_-10px_rgba(16,185,129,0.4)]",
        border: "border-emerald-500/25 hover:border-emerald-500/60 dark:border-emerald-500/30",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        iconBg: "from-emerald-500 to-teal-600 text-white shadow-emerald-500/30",
        text: "text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
        gradient: "from-emerald-500/5 via-teal-500/[0.02] to-transparent",
        numberBadge: "bg-emerald-500 text-white",
      },
    },
    {
      id: "work",
      number: "3",
      title: "شغلي",
      subtitle: "الشراكات، تعاقدات والفرص",
      href: "/dashboard/work",
      icon: Briefcase,
      accent: {
        glow: "group-hover:shadow-[0_0_60px_-10px_rgba(59,130,246,0.4)]",
        border: "border-blue-500/25 hover:border-blue-500/60 dark:border-blue-500/30",
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        iconBg: "from-blue-500 to-indigo-600 text-white shadow-blue-500/30",
        text: "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400",
        gradient: "from-blue-500/5 via-indigo-500/[0.02] to-transparent",
        numberBadge: "bg-blue-600 text-white",
      },
    },
  ];

  return (
    <main className="relative flex min-h-[calc(100vh-140px)] w-full flex-col items-center justify-center overflow-hidden py-10">
      {/* Ambient glowing atmosphere */}
      <div className="pointer-events-none absolute -top-24 start-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[130px] dark:bg-emerald-500/15" />
      <div className="pointer-events-none absolute top-1/2 start-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[140px] dark:bg-pink-500/15" />
      <div className="pointer-events-none absolute bottom-0 start-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[130px] dark:bg-blue-600/15" />

      {/* Top Quick Link to "نفسك في إيه؟" */}
      <div className="relative z-10 mb-8">
        <Link
          href="/dashboard/wishes"
          className="group inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-white/70 px-4 py-2 text-xs font-black text-slate-800 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-700 dark:border-white/10 dark:bg-navy-800/80 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
        >
          <Sparkles size={14} className="text-emerald-500 transition group-hover:rotate-12" />
          <span>مساحة التخطيط والأمنيات: <strong>نفسك في إيه؟</strong></span>
          <ChevronLeft size={14} className="text-slate-400 transition group-hover:-translate-x-1 dark:text-slate-500" />
        </Link>
      </div>

      {/* Main Centered 3 Circles Container */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Subtle illuminated connecting spine */}
        <div className="pointer-events-none absolute top-16 bottom-16 w-0.5 bg-gradient-to-b from-pink-500/30 via-emerald-500/30 to-blue-500/30 dark:from-pink-500/20 dark:via-emerald-500/20 dark:to-blue-500/20" />

        <div className="relative flex w-full flex-col items-center gap-7">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <div key={hub.id} className="relative flex items-center justify-center">
                <Link
                  href={hub.href}
                  className={`group relative flex h-48 w-48 flex-col items-center justify-center rounded-full border bg-gradient-to-b ${hub.accent.gradient} ${hub.accent.border} bg-white/85 p-4 text-center shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:scale-105 active:scale-95 dark:bg-navy-800/90 ${hub.accent.glow} sm:h-52 sm:w-52`}
                >
                  {/* Outer subtle ring */}
                  <div className="pointer-events-none absolute inset-1 rounded-full border border-white/50 dark:border-white/5" />

                  {/* Number Badge */}
                  <div
                    className={`absolute -top-1 start-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full text-[11px] font-black shadow-md ${hub.accent.numberBadge}`}
                  >
                    {hub.number}
                  </div>

                  {/* Icon Badge */}
                  <div
                    className={`relative mb-2 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${hub.accent.iconBg} sm:h-14 sm:w-14`}
                  >
                    <Icon size={26} className="sm:size-7" />
                  </div>

                  {/* Main Title */}
                  <h2
                    className={`text-2xl font-black tracking-tight transition-colors duration-300 sm:text-3xl ${hub.accent.text}`}
                  >
                    {hub.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="mt-1 line-clamp-1 max-w-[85%] text-[11px] font-semibold text-slate-500 transition-colors duration-300 dark:text-slate-400 sm:text-xs">
                    {hub.subtitle}
                  </p>

                  {/* Hover Enter Arrow Indicator */}
                  <div className="mt-1 flex items-center gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
                      دخول
                    </span>
                    <ChevronLeft size={12} className="text-slate-700 dark:text-slate-200" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
