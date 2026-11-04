"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  Lightbulb,
  Trash2,
  Briefcase,
  Home,
  Users,
  ChevronLeft,
  Flame,
  Target,
  Compass,
  Star,
  Check,
} from "lucide-react";

export type WishCategory = "work" | "home" | "family" | "personal" | "travel";
export type WishStatus = "planning" | "in_progress" | "achieved";

export interface WishItem {
  id: string;
  title: string;
  category: WishCategory;
  status: WishStatus;
  createdAt: string;
  targetDate?: string;
}

const CATEGORY_META: Record<
  WishCategory,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  work: {
    label: "💼 عمل ومشروع",
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    icon: Briefcase,
  },
  home: {
    label: "🏡 لبيتي ومنزلي",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    icon: Home,
  },
  family: {
    label: "👨‍👩‍👧‍👦 عائلتي وأحبابي",
    bg: "bg-pink-500/10 dark:bg-pink-500/15",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-500/20",
    icon: Users,
  },
  personal: {
    label: "🌟 طموح شخصي",
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
    icon: Target,
  },
  travel: {
    label: "✈️ سفر واستجمام",
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    icon: Compass,
  },
};

const STATUS_META: Record<
  WishStatus,
  { label: string; badge: string; icon: any; nextLabel: string }
> = {
  planning: {
    label: "💡 فكرة قيد التخطيط",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Lightbulb,
    nextLabel: "بدء التنفيذ",
  },
  in_progress: {
    label: "⏳ جاري العمل عليها",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Clock,
    nextLabel: "تم التحقيق بنجاح 🎉",
  },
  achieved: {
    label: "🎉 تم التحقيق بنجاح",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
    nextLabel: "إعادة للتخطيط",
  },
};

const DEFAULT_WISHES: WishItem[] = [
  {
    id: "w-1",
    title: "توقيع اتفاقية الشراكة الاستراتيجية وتوسيع أعمال الشركة",
    category: "work",
    status: "in_progress",
    createdAt: "2026-03-01",
    targetDate: "نهاية الربع الحالي",
  },
  {
    id: "w-2",
    title: "تنظيم رحلة عائلية واستجمام نهاية الأسبوع",
    category: "family",
    status: "planning",
    createdAt: "2026-03-02",
    targetDate: "الجمعة القادمة",
  },
  {
    id: "w-3",
    title: "تجديد وتأثيث غرفة المعيشة في البيت",
    category: "home",
    status: "achieved",
    createdAt: "2026-02-15",
    targetDate: "تم الإنجاز",
  },
  {
    id: "w-4",
    title: "تعلّم واحتراف أدوات الذكاء الاصطناعي لتطوير أعمالي",
    category: "personal",
    status: "in_progress",
    createdAt: "2026-03-03",
    targetDate: "خلال شهرين",
  },
];

const INSPIRATIONS = [
  { text: "🚀 إطلاق فرصة تجارية جديدة", category: "work" as WishCategory },
  { text: "🏝️ إجازة عائلية مميزة", category: "family" as WishCategory },
  { text: "🏠 تجديد صيانة المنزل", category: "home" as WishCategory },
  { text: "💰 خطة ادخار واستثمار سنوية", category: "personal" as WishCategory },
  { text: "🤝 توسيع شبكة شركاء الأعمال", category: "work" as WishCategory },
];

const STORAGE_KEY = "opekia_wishes_v1";

export default function WishesClient() {
  const [mounted, setMounted] = useState(false);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedCat, setSelectedCat] = useState<WishCategory>("work");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          setWishes(JSON.parse(raw));
        } else {
          setWishes(DEFAULT_WISHES);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WISHES));
        }
      } catch (e) {
        setWishes(DEFAULT_WISHES);
      }
    }
  }, []);

  const saveWishes = (updated: WishItem[]) => {
    setWishes(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  const handleAddWish = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const newWish: WishItem = {
      id: "w-" + Date.now(),
      title: trimmed,
      category: selectedCat,
      status: "planning",
      createdAt: new Date().toISOString().split("T")[0],
      targetDate: "قيد التحديد",
    };

    saveWishes([newWish, ...wishes]);
    setInputText("");
    setToast("✨ تم تسجيل رغبتك بنجاح!");
    setTimeout(() => setToast(""), 2500);
  };

  const handleQuickAdd = (text: string, cat: WishCategory) => {
    const newWish: WishItem = {
      id: "w-" + Date.now(),
      title: text,
      category: cat,
      status: "planning",
      createdAt: new Date().toISOString().split("T")[0],
      targetDate: "قيد التحديد",
    };

    saveWishes([newWish, ...wishes]);
    setToast(`✨ تمت إضافة: "${text}"`);
    setTimeout(() => setToast(""), 2500);
  };

  const advanceStatus = (id: string) => {
    const updated = wishes.map((w) => {
      if (w.id !== id) return w;
      const nextStatus: WishStatus =
        w.status === "planning"
          ? "in_progress"
          : w.status === "in_progress"
          ? "achieved"
          : "planning";
      return { ...w, status: nextStatus };
    });
    saveWishes(updated);
  };

  const deleteWish = (id: string) => {
    saveWishes(wishes.filter((w) => w.id !== id));
  };

  const filteredWishes = useMemo(() => {
    if (activeFilter === "all") return wishes;
    return wishes.filter((w) => w.category === activeFilter);
  }, [wishes, activeFilter]);

  const stats = useMemo(() => {
    const total = wishes.length;
    const achieved = wishes.filter((w) => w.status === "achieved").length;
    const inProgress = wishes.filter((w) => w.status === "in_progress").length;
    const rate = total > 0 ? Math.round((achieved / total) * 100) : 0;
    return { total, achieved, inProgress, rate };
  }, [wishes]);

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full overflow-hidden pb-16">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 start-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[130px] dark:bg-emerald-500/15" />
      <div className="pointer-events-none absolute top-1/3 start-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[130px] dark:bg-blue-500/15" />

      {/* HERO SECTION: "نفسك في إيه؟" */}
      <div className="relative z-10 mx-auto max-w-4xl text-center pt-6 sm:pt-10">
        {/* Glow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600 backdrop-blur-md dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
          <Sparkles size={14} className="animate-pulse" />
          <span>مساحتك الذكية في أوبكيا</span>
        </div>

        {/* The Main Majestic Title */}
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-blue-400">
            نفسك في إيه؟
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-slate-600 dark:text-slate-300 sm:text-base md:text-lg">
          شاركنا فكرتك، رغبتك القادمة، أو طموحك الذي ترغب بتحقيقه.. ودع منصة أوبكيا تنظّم لك المسار
          وتتابع إنجازه خطوة بخطوة.
        </p>

        {/* SMART INPUT FORM */}
        <form
          onSubmit={handleAddWish}
          className="mx-auto mt-8 max-w-3xl rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-2xl backdrop-blur-xl transition dark:border-white/10 dark:bg-navy-800/80 sm:p-4"
        >
          <div className="flex flex-col gap-3">
            {/* Input Row */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب هنا ما يدور في بالك الآن.. (مثال: أوقّع عقد جديد، أجدد غرفة في البيت، أسافر مع العيلة)"
                className="w-full rounded-2xl border-none bg-slate-50 px-4 py-3.5 pe-12 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-500 dark:bg-navy-900/90 dark:text-white dark:placeholder-slate-500 sm:py-4 sm:text-base"
              />
              <button
                type="submit"
                className="absolute end-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 sm:h-11 sm:w-11"
                disabled={!inputText.trim()}
                title="تسجيل الأمنية"
              >
                <Send size={18} className="rtl:rotate-180" />
              </button>
            </div>

            {/* Category Selector Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ms-1">
                التصنيف:
              </span>
              {(Object.keys(CATEGORY_META) as WishCategory[]).map((cat) => {
                const meta = CATEGORY_META[cat];
                const active = selectedCat === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCat(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* QUICK INSPIRATION CHIPS */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            أفكار ملهمة:
          </span>
          {INSPIRATIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickAdd(item.text, item.category)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-500/40 hover:bg-emerald-50/50 hover:text-emerald-700 dark:border-white/10 dark:bg-navy-800/60 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
            >
              <Plus size={12} className="text-emerald-500" />
              {item.text}
            </button>
          ))}
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="mx-auto mt-10 max-w-4xl px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-navy-800/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                إجمالي الأمنيات
              </span>
              <Star size={16} className="text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-black">{stats.total}</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-navy-800/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                جاري تحقيقها
              </span>
              <Clock size={16} className="text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
              {stats.inProgress}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-navy-800/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                تم تحقيقها 🎉
              </span>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.achieved}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-navy-800/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                نسبة الإنجاز
              </span>
              <Flame size={16} className="text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
              %{stats.rate}
            </div>
          </div>
        </div>
      </div>

      {/* WISHES & GOALS BOARD */}
      <div className="mx-auto mt-10 max-w-4xl px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Target className="text-emerald-500" size={22} />
            <h2 className="text-xl font-black">أمنياتي وخططي الحالية</h2>
            <span className="rounded-full bg-slate-200/60 px-2 py-0.5 text-xs font-bold dark:bg-white/10">
              {filteredWishes.length}
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveFilter("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeFilter === "all"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-white/80 text-slate-600 hover:bg-slate-100 dark:bg-navy-800 dark:text-slate-300"
              }`}
            >
              الكل
            </button>
            {(Object.keys(CATEGORY_META) as WishCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeFilter === cat
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-white/80 text-slate-600 hover:bg-slate-100 dark:bg-navy-800 dark:text-slate-300"
                }`}
              >
                {CATEGORY_META[cat].label.split(" ")[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Wishes List */}
        <div className="mt-5 space-y-3">
          {filteredWishes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-white/10">
              <Lightbulb size={36} className="mx-auto text-slate-400" />
              <h3 className="mt-3 text-base font-bold">لا توجد أمنيات مسجلة في هذا التصنيف</h3>
              <p className="mt-1 text-xs text-slate-500">
                اكتب ما يخطر في بالك بالأعلى ودعنا نسجّلها معاً!
              </p>
            </div>
          ) : (
            filteredWishes.map((item) => {
              const catMeta = CATEGORY_META[item.category];
              const stMeta = STATUS_META[item.status];
              const CatIcon = catMeta.icon;

              return (
                <div
                  key={item.id}
                  className={`group relative flex flex-col justify-between gap-4 rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-navy-800/80 sm:flex-row sm:items-center ${
                    item.status === "achieved"
                      ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                      : "border-slate-200 dark:border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${catMeta.bg} ${catMeta.border} ${catMeta.text}`}
                    >
                      <CatIcon size={18} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${catMeta.bg} ${catMeta.border} ${catMeta.text}`}
                        >
                          {catMeta.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${stMeta.badge}`}
                        >
                          <stMeta.icon size={11} />
                          {stMeta.label}
                        </span>
                      </div>

                      <h3
                        className={`mt-1.5 text-sm font-bold sm:text-base ${
                          item.status === "achieved"
                            ? "text-slate-500 line-through dark:text-slate-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {item.title}
                      </h3>

                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>سُجّلت: {item.createdAt}</span>
                        {item.targetDate && <span>• الموعد المستهدف: {item.targetDate}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => advanceStatus(item.id)}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm transition ${
                        item.status === "achieved"
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
                          : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20"
                      }`}
                    >
                      {item.status === "achieved" ? (
                        <Check size={14} />
                      ) : (
                        <Clock size={14} />
                      )}
                      <span>{stMeta.nextLabel}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteWish(item.id)}
                      className="rounded-xl p-2 text-slate-400 opacity-60 transition hover:bg-rose-500/10 hover:text-rose-500 hover:opacity-100 dark:hover:bg-rose-500/20"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
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
