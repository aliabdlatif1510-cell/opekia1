"use client";

import Link from "next/link";
import { Users, Home, Briefcase, ChevronLeft, Sparkles, ArrowDown, ShieldCheck, Compass } from "lucide-react";

export default function DashboardClient() {
  const hubs = [
    {
      id: "family",
      index: "01",
      code: "FAMILY // HUB",
      title: "عائلتي",
      summary: "الأجندة • المهام • الأرشيف المشفّر",
      href: "/dashboard/family",
      icon: Users,
      theme: {
        aura: "group-hover:shadow-[0_0_80px_-15px_rgba(244,63,94,0.45)]",
        border: "border-rose-500/20 group-hover:border-rose-500/60 dark:border-rose-500/30",
        ringBorder: "border-rose-500/30",
        indexText: "text-rose-500 dark:text-rose-400",
        dotBg: "bg-rose-500",
        iconGlow: "from-rose-500 to-pink-600 text-white shadow-rose-500/40",
        titleHover: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
        lensCore: "from-rose-500/[0.08] via-pink-500/[0.03] to-transparent",
        satellite: "border-rose-400 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]",
      },
    },
    {
      id: "home",
      index: "02",
      code: "HOME // DOMAIN",
      title: "بيتي",
      summary: "المصروفات • الفواتير • الصيانة الذكية",
      href: "/dashboard/home",
      icon: Home,
      theme: {
        aura: "group-hover:shadow-[0_0_80px_-15px_rgba(16,185,129,0.45)]",
        border: "border-emerald-500/20 group-hover:border-emerald-500/60 dark:border-emerald-500/30",
        ringBorder: "border-emerald-500/30",
        indexText: "text-emerald-500 dark:text-emerald-400",
        dotBg: "bg-emerald-500",
        iconGlow: "from-emerald-500 to-teal-600 text-white shadow-emerald-500/40",
        titleHover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
        lensCore: "from-emerald-500/[0.08] via-teal-500/[0.03] to-transparent",
        satellite: "border-emerald-400 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]",
      },
    },
    {
      id: "work",
      index: "03",
      code: "WORK // VENTURE",
      title: "شغلي",
      summary: "الشراكات • تعاقدات • مسار الفرص",
      href: "/dashboard/work",
      icon: Briefcase,
      theme: {
        aura: "group-hover:shadow-[0_0_80px_-15px_rgba(59,130,246,0.45)]",
        border: "border-blue-500/20 group-hover:border-blue-500/60 dark:border-blue-500/30",
        ringBorder: "border-blue-500/30",
        indexText: "text-blue-500 dark:text-blue-400",
        dotBg: "bg-blue-500",
        iconGlow: "from-blue-500 to-indigo-600 text-white shadow-blue-500/40",
        titleHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
        lensCore: "from-blue-500/[0.08] via-indigo-500/[0.03] to-transparent",
        satellite: "border-blue-400 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]",
      },
    },
  ];

  return (
    <main className="relative flex min-h-[calc(100vh-140px)] w-full flex-col items-center justify-center overflow-hidden py-12">
      {/* Architectural Background Grid with Radial Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern-light opacity-60 dark:bg-grid-pattern dark:opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-radial-vignette from-transparent via-slate-50/70 to-slate-100 dark:via-[#07090e]/70 dark:to-[#07090e]" />

      {/* Atmospheric Spatial Aura Fields */}
      <div className="pointer-events-none absolute -top-32 start-1/2 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-rose-500/[0.06] blur-[150px] dark:bg-rose-500/[0.08]" />
      <div className="pointer-events-none absolute top-1/2 start-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.06] blur-[150px] dark:bg-emerald-500/[0.08]" />
      <div className="pointer-events-none absolute -bottom-32 start-1/2 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-blue-600/[0.06] blur-[150px] dark:bg-blue-600/[0.08]" />

      {/* Sleek Executive Status & Wish Shortcut */}
      <div className="relative z-10 mb-10 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1220]/70 dark:text-slate-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span>المساحة الذكية النشطة</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="font-mono text-[10px] text-slate-400">OPEKIA // SPATIAL v2</span>
        </div>

        <Link
          href="/dashboard/wishes"
          className="group flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-1.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-700 dark:border-white/10 dark:bg-[#0c1220]/70 dark:text-slate-200 dark:hover:border-emerald-400/40 dark:hover:text-emerald-400"
        >
          <Sparkles size={13} className="text-emerald-500 transition-transform duration-300 group-hover:scale-125" />
          <span>نفسك في إيه؟</span>
          <ChevronLeft size={13} className="text-slate-400 transition-transform duration-300 group-hover:-translate-x-1 dark:text-slate-500" />
        </Link>
      </div>

      {/* Main Spatial Sphere Array */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        {/* Kinetic Optical Waveguide Spine with Flowing Photon Beam */}
        <div className="pointer-events-none absolute top-16 bottom-16 w-[1.5px] bg-gradient-to-b from-rose-500/30 via-emerald-500/30 to-blue-500/30 dark:from-rose-500/20 dark:via-emerald-500/20 dark:to-blue-500/20">
          <div className="h-20 w-full animate-laser bg-gradient-to-b from-transparent via-white to-transparent dark:via-emerald-400" />
        </div>

        {/* Vertical Order of Spheres */}
        <div className="relative flex w-full flex-col items-center gap-10">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <div key={hub.id} className="relative flex items-center justify-center">
                {/* Outer Precision Instrument Ring with Calibration Ticks */}
                <div
                  className={`pointer-events-none absolute -inset-3.5 rounded-full border border-dashed ${hub.theme.ringBorder} opacity-40 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105`}
                />

                {/* Main Interactive Tactile Sphere */}
                <Link
                  href={hub.href}
                  className={`group relative flex h-52 w-52 flex-col items-center justify-center rounded-full border bg-gradient-to-b ${hub.theme.lensCore} ${hub.theme.border} bg-white/75 p-5 text-center shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5 hover:scale-105 active:scale-95 dark:bg-[#0c1220]/80 ${hub.theme.aura} specular-lens-light dark:specular-lens sm:h-60 sm:w-60`}
                >
                  {/* Internal Specular Highlight Arc */}
                  <div className="pointer-events-none absolute inset-1.5 rounded-full border border-white/60 dark:border-white/10" />

                  {/* Micro Index Monospace Tag */}
                  <div className="absolute top-4 flex items-center gap-1.5">
                    <span className={`font-mono text-[11px] font-black tracking-widest ${hub.theme.indexText}`}>
                      {hub.index}
                    </span>
                    <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                      {hub.code}
                    </span>
                  </div>

                  {/* Tactile Icon Reticle */}
                  <div
                    className={`relative mb-2 mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${hub.theme.iconGlow} sm:h-16 sm:w-16`}
                  >
                    <Icon size={28} className="sm:size-8" />
                  </div>

                  {/* Monumental Modern Arabic Title */}
                  <h2
                    className={`text-2xl font-black tracking-tight text-slate-900 transition-colors duration-300 dark:text-white sm:text-3xl ${hub.theme.titleHover}`}
                  >
                    {hub.title}
                  </h2>

                  {/* Executive Telemetry Summary */}
                  <p className="mt-1 line-clamp-1 max-w-[88%] text-[10px] font-bold text-slate-500 transition-colors duration-300 dark:text-slate-400 sm:text-[11px]">
                    {hub.summary}
                  </p>

                  {/* Minimalist Micro Action Target */}
                  <div className="mt-2 flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-white/40 px-3 py-0.5 text-[10px] font-extrabold text-slate-600 opacity-0 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <span>دخول المحور</span>
                    <ChevronLeft size={11} className="transition-transform group-hover:-translate-x-0.5" />
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
