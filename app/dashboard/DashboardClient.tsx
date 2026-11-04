"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Home,
  Briefcase,
  ChevronLeft,
  Sparkles,
  Heart,
  TrendingUp,
  Shield,
  ArrowUpRight,
  Activity,
  Layers,
} from "lucide-react";

export default function DashboardClient() {
  const [hoveredHub, setHoveredHub] = useState<string | null>(null);

  const hubs = [
    {
      id: "family",
      number: "1",
      title: "عائلتي",
      subtitle: "المناسبات، الأجندة والوثائق",
      href: "/dashboard/family",
      icon: Users,
      stats: { primary: "٤ أفراد", secondary: "مناسبة قادمة" },
      colors: {
        glow: "hover:shadow-[0_0_70px_rgba(236,72,153,0.45)] dark:hover:shadow-[0_0_80px_rgba(244,63,94,0.5)]",
        border: "border-pink-300 dark:border-pink-500/40 hover:border-pink-500",
        numberBg: "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/40",
        iconBg: "from-pink-500 to-rose-600 text-white shadow-xl shadow-pink-500/35",
        text: "text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400",
        gradient: "from-pink-500/10 via-rose-500/[0.04] to-transparent",
        ambientGlow: "bg-pink-500/20 dark:bg-pink-500/25",
        pill: "bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300 border-pink-200 dark:border-pink-500/20",
        ringColor: "stroke-pink-500",
      },
    },
    {
      id: "home",
      number: "2",
      title: "بيتي",
      subtitle: "المصروفات، الفواتير والصيانة",
      href: "/dashboard/home",
      icon: Home,
      stats: { primary: "ميزانية مستقرة", secondary: "صيانة مجدولة" },
      colors: {
        glow: "hover:shadow-[0_0_70px_rgba(16,185,129,0.45)] dark:hover:shadow-[0_0_80px_rgba(16,185,129,0.5)]",
        border: "border-emerald-300 dark:border-emerald-500/40 hover:border-emerald-500",
        numberBg: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/40",
        iconBg: "from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/35",
        text: "text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
        gradient: "from-emerald-500/10 via-teal-500/[0.04] to-transparent",
        ambientGlow: "bg-emerald-500/20 dark:bg-emerald-500/25",
        pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20",
        ringColor: "stroke-emerald-500",
      },
    },
    {
      id: "work",
      number: "3",
      title: "شغلي",
      subtitle: "الشراكات، التعاقدات، الفرص والتوصيات",
      href: "/dashboard/work",
      icon: Briefcase,
      stats: { primary: "٣ شراكات نشطة", secondary: "توصيات حية مرتبطة بالهوم" },
      colors: {
        glow: "hover:shadow-[0_0_70px_rgba(59,130,246,0.45)] dark:hover:shadow-[0_0_80px_rgba(59,130,246,0.5)]",
        border: "border-blue-300 dark:border-blue-500/40 hover:border-blue-500",
        numberBg: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40",
        iconBg: "from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/35",
        text: "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400",
        gradient: "from-blue-500/10 via-indigo-500/[0.04] to-transparent",
        ambientGlow: "bg-blue-500/20 dark:bg-blue-500/25",
        pill: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-200 dark:border-blue-500/20",
        ringColor: "stroke-blue-500",
      },
    },
  ];

  return (
    <main className="relative flex min-h-[calc(100vh-140px)] w-full flex-col items-center justify-center overflow-hidden py-10">
      {/* Dynamic Ambient Color Orbs that React to Hover */}
      <div
        className={`pointer-events-none absolute -top-20 start-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-[140px] transition-all duration-700 ${
          hoveredHub === "family"
            ? "bg-pink-500/30 scale-125"
            : hoveredHub === "home"
            ? "bg-emerald-500/30 scale-125"
            : hoveredHub === "work"
            ? "bg-blue-600/30 scale-125"
            : "bg-pink-500/15"
        }`}
      />
      <div className="pointer-events-none absolute top-1/2 start-1/4 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 end-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-[140px]" />



      {/* Main Container */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Luminous Animated Connecting Line */}
        <div className="pointer-events-none absolute top-16 bottom-16 w-1 rounded-full bg-gradient-to-b from-pink-500 via-emerald-500 to-blue-500 opacity-30 shadow-[0_0_15px_rgba(16,185,129,0.5)] dark:opacity-40" />

        {/* 3 Circular Portals in Vertical Order */}
        <div className="relative flex w-full flex-col items-center gap-7">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            const isHovered = hoveredHub === hub.id;

            return (
              <div
                key={hub.id}
                onMouseEnter={() => setHoveredHub(hub.id)}
                onMouseLeave={() => setHoveredHub(null)}
                className="relative flex items-center justify-center"
              >
                {/* Luminous Ambient Glow Behind Each Circle */}
                <div
                  className={`pointer-events-none absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${
                    hub.colors.ambientGlow
                  } ${isHovered ? "opacity-100 scale-110" : "opacity-40 scale-95"}`}
                />

                {/* The Circular Button / Portal */}
                <Link
                  href={hub.href}
                  className={`group relative flex h-52 w-52 flex-col items-center justify-center rounded-full border-2 bg-gradient-to-b ${hub.colors.gradient} ${hub.colors.border} bg-white/90 p-4 text-center shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 active:scale-95 dark:bg-navy-800/90 ${hub.colors.glow} sm:h-56 sm:w-56`}
                >
                  {/* Inner Specular Ring */}
                  <div className="pointer-events-none absolute inset-1.5 rounded-full border border-white/70 dark:border-white/10" />

                  {/* Elegant Number Badge (1, 2, 3) */}
                  <div
                    className={`absolute -top-2 start-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-xs font-black ring-4 ring-white dark:ring-navy-900 ${hub.colors.numberBg}`}
                  >
                    {hub.number}
                  </div>

                  {/* Icon Capsule with Radiant Gradient */}
                  <div
                    className={`relative mb-2 mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-all duration-500 group-hover:scale-115 group-hover:rotate-6 ${hub.colors.iconBg} sm:h-15 sm:w-15`}
                  >
                    <Icon size={28} className="sm:size-7" />
                  </div>

                  {/* Bold Arabic Title */}
                  <h2
                    className={`text-2xl font-black tracking-tight transition-colors duration-300 sm:text-3xl ${hub.colors.text}`}
                  >
                    {hub.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="mt-1 line-clamp-1 max-w-[85%] text-[11px] font-semibold text-slate-500 transition-colors duration-300 dark:text-slate-400 sm:text-xs">
                    {hub.subtitle}
                  </p>

                  {/* Micro Live Pill */}
                  <div
                    className={`mt-2 flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black transition-all duration-300 ${hub.colors.pill}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                    <span>{hub.stats.primary}</span>
                  </div>

                  {/* Enter Indicator on Hover */}
                  <div className="absolute -bottom-3 flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-1 dark:bg-white dark:text-slate-900">
                    <span>دخول</span>
                    <ChevronLeft size={11} />
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
