"use client";

import Link from "next/link";
import { Users, Home, Briefcase, ChevronLeft, Sparkles } from "lucide-react";

export default function DashboardClient() {
  const hubs = [
    {
      id: "family",
      title: "عائلتي",
      subtitle: "المناسبات، المهام والوثائق",
      href: "/dashboard/family",
      icon: Users,
      accent: {
        glow: "group-hover:shadow-[0_0_50px_-10px_rgba(236,72,153,0.35)]",
        border: "border-pink-500/20 hover:border-pink-500/60 dark:border-pink-500/30",
        badge: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
        iconBg: "from-pink-500 to-rose-600 text-white shadow-pink-500/30",
        text: "text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400",
        gradient: "from-pink-500/5 via-rose-500/[0.02] to-transparent",
        dot: "bg-pink-500",
      },
    },
    {
      id: "home",
      title: "بيتي",
      subtitle: "المصروفات، الفواتير والصيانة",
      href: "/dashboard/home",
      icon: Home,
      accent: {
        glow: "group-hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.35)]",
        border: "border-emerald-500/20 hover:border-emerald-500/60 dark:border-emerald-500/30",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        iconBg: "from-emerald-500 to-teal-600 text-white shadow-emerald-500/30",
        text: "text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
        gradient: "from-emerald-500/5 via-teal-500/[0.02] to-transparent",
        dot: "bg-emerald-500",
      },
    },
    {
      id: "work",
      title: "شغلي",
      subtitle: "العقود، الشراكات والمهام",
      href: "/dashboard/work",
      icon: Briefcase,
      accent: {
        glow: "group-hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.35)]",
        border: "border-blue-500/20 hover:border-blue-500/60 dark:border-blue-500/30",
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        iconBg: "from-blue-500 to-indigo-600 text-white shadow-blue-500/30",
        text: "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400",
        gradient: "from-blue-500/5 via-indigo-500/[0.02] to-transparent",
        dot: "bg-blue-500",
      },
    },
  ];

  return (
    <main className="relative flex min-h-[calc(100vh-140px)] w-full items-center justify-center overflow-hidden py-10">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none absolute -top-20 start-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/15" />
      <div className="pointer-events-none absolute bottom-0 start-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px] dark:bg-blue-600/15" />

      {/* Main Centered Container */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Subtle decorative connecting spine */}
        <div className="pointer-events-none absolute top-16 bottom-16 w-0.5 bg-gradient-to-b from-pink-500/30 via-emerald-500/30 to-blue-500/30 dark:from-pink-500/20 dark:via-emerald-500/20 dark:to-blue-500/20" />

        <div className="relative flex w-full flex-col items-center gap-6">
          {hubs.map((hub, index) => {
            const Icon = hub.icon;
            return (
              <div key={hub.id} className="relative flex items-center justify-center">
                <Link
                  href={hub.href}
                  className={`group relative flex h-44 w-44 flex-col items-center justify-center rounded-full border bg-gradient-to-b ${hub.accent.gradient} ${hub.accent.border} bg-white/80 p-4 text-center shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:scale-105 active:scale-95 dark:bg-navy-800/90 ${hub.accent.glow} sm:h-48 sm:w-48`}
                >
                  {/* Subtle inner ring highlight */}
                  <div className="pointer-events-none absolute inset-1 rounded-full border border-white/40 dark:border-white/5" />

                  {/* Icon with glowing squircle badge */}
                  <div
                    className={`relative mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${hub.accent.iconBg} sm:h-14 sm:w-14`}
                  >
                    <Icon size={24} className="sm:size-7" />
                  </div>

                  {/* Main Title */}
                  <h2
                    className={`text-2xl font-black tracking-tight transition-colors duration-300 sm:text-3xl ${hub.accent.text}`}
                  >
                    {hub.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-slate-500 transition-colors duration-300 dark:text-slate-400 sm:text-xs">
                    {hub.subtitle}
                  </p>

                  {/* Interactive arrow hover indicator */}
                  <div className="mt-1.5 flex items-center gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      دخول
                    </span>
                    <ChevronLeft size={12} className="text-slate-600 dark:text-slate-300" />
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
