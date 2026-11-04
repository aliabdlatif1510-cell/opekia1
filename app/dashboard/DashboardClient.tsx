"use client";

import Link from "next/link";
import { FileText, Home, Briefcase } from "lucide-react";

export default function DashboardClient() {
  const circles = [
    {
      title: "عقود",
      href: "/dashboard/work",
      icon: FileText,
      gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
      border: "border-emerald-500/30 hover:border-emerald-400",
      textColor: "text-emerald-400 group-hover:text-emerald-300",
      iconColor: "text-emerald-400 group-hover:scale-110",
      shadow: "hover:shadow-emerald-500/20",
    },
    {
      title: "بيتي",
      href: "/dashboard/home",
      icon: Home,
      gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
      border: "border-blue-500/30 hover:border-blue-400",
      textColor: "text-blue-400 group-hover:text-blue-300",
      iconColor: "text-blue-400 group-hover:scale-110",
      shadow: "hover:shadow-blue-500/20",
    },
    {
      title: "شغلي",
      href: "/dashboard/work",
      icon: Briefcase,
      gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
      border: "border-amber-500/30 hover:border-amber-400",
      textColor: "text-amber-400 group-hover:text-amber-300",
      iconColor: "text-amber-400 group-hover:scale-110",
      shadow: "hover:shadow-amber-500/20",
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center py-8">
      <div className="flex flex-col items-center justify-center gap-7">
        {circles.map((circle) => {
          const Icon = circle.icon;
          return (
            <Link
              key={circle.title}
              href={circle.href}
              className={`group relative flex h-40 w-40 flex-col items-center justify-center rounded-full border-2 bg-gradient-to-b ${circle.gradient} ${circle.border} bg-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-2xl ${circle.shadow} active:scale-95 dark:bg-navy-800/90 sm:h-44 sm:w-44 md:h-48 md:w-48`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <Icon
                  size={36}
                  className={`transition-transform duration-300 ${circle.iconColor}`}
                />
                <span className={`text-2xl font-black tracking-wide sm:text-3xl ${circle.textColor}`}>
                  {circle.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
