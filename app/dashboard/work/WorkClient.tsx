"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  Handshake,
  FileCheck2,
  TrendingUp,
  Sparkles,
  Send,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  SEED_PARTNERSHIPS,
  SEED_CONTRACTS,
  SEED_OPPORTUNITIES,
  type Partnership,
  type ContractItem,
  type Opportunity,
} from "@/lib/work-three";
import {
  SEED_RECOMMENDATIONS,
  type Recommendation,
} from "@/lib/recommendations";
import {
  KEY_PARTNERSHIPS,
  KEY_CONTRACTS,
  KEY_OPPORTUNITIES,
  KEY_RECOMMENDATIONS,
} from "@/lib/portal-sync";

const KEY_P = KEY_PARTNERSHIPS;
const KEY_C = KEY_CONTRACTS;
const KEY_O = KEY_OPPORTUNITIES;
const KEY_R = KEY_RECOMMENDATIONS;

type ActiveSection = "partnerships" | "contracts" | "opportunities" | "recommendations";

export default function WorkClient() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveSection>("partnerships");

  // Open Message Input
  const [messageInput, setMessageInput] = useState("");
  const [toast, setToast] = useState("");

  // Today's automatic date formatted
  const todayDate = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  // Listen to URL query params for direct tab selection
  useEffect(() => {
    if (!searchParams) return;
    const tab = searchParams.get("tab");
    if (
      tab === "partnerships" ||
      tab === "contracts" ||
      tab === "opportunities" ||
      tab === "recommendations"
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Data states
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const rawP = localStorage.getItem(KEY_P);
        setPartnerships(rawP ? JSON.parse(rawP) : SEED_PARTNERSHIPS);

        const rawC = localStorage.getItem(KEY_C);
        setContracts(rawC ? JSON.parse(rawC) : SEED_CONTRACTS);

        const rawO = localStorage.getItem(KEY_O);
        setOpportunities(rawO ? JSON.parse(rawO) : SEED_OPPORTUNITIES);

        const rawR = localStorage.getItem(KEY_R);
        setRecommendations(rawR ? JSON.parse(rawR) : SEED_RECOMMENDATIONS);
      } catch (e) {
        console.error("Failed to load work data:", e);
      }
    }
  }, []);

  // Save changes to localStorage & notify connected portals in real time
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        localStorage.setItem(KEY_P, JSON.stringify(partnerships));
        localStorage.setItem(KEY_C, JSON.stringify(contracts));
        localStorage.setItem(KEY_O, JSON.stringify(opportunities));
        localStorage.setItem(KEY_R, JSON.stringify(recommendations));
        window.dispatchEvent(new Event("opekia_data_updated"));
      } catch {}
    }
  }, [partnerships, contracts, opportunities, recommendations, mounted]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Open Message Submission (Automatic Date)
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    const text = messageInput.trim();
    if (!text) return;

    const autoDate = todayDate;
    const id = `${Date.now()}`;

    if (activeTab === "partnerships") {
      const newItem: Partnership & { date?: string } = {
        id: `p-${id}`,
        name: text,
        field: "شراكة استراتيجية",
        type: "strategic",
        status: "active",
        contact: "الإدارة",
        notes: text,
        date: autoDate,
      };
      setPartnerships([newItem as any, ...partnerships]);
      setToast("✅ تمت إضافة رسالة الشراكة بالتاريخ التلقائي");
    } else if (activeTab === "contracts") {
      const newItem: ContractItem & { date?: string } = {
        id: `c-${id}`,
        title: text,
        party: "جهة معتمدة",
        value: 0,
        startDate: autoDate,
        endDate: autoDate,
        progress: 100,
        status: "active",
        notes: text,
        date: autoDate,
      };
      setContracts([newItem as any, ...contracts]);
      setToast("✅ تمت إضافة رسالة التعاقد بالتاريخ التلقائي");
    } else if (activeTab === "opportunities") {
      const newItem: Opportunity & { date?: string } = {
        id: `op-${id}`,
        title: text,
        client: "فرصة استثمارية",
        estimatedValue: 0,
        stage: "lead",
        probability: 100,
        expectedClose: autoDate,
        notes: text,
        date: autoDate,
      };
      setOpportunities([newItem as any, ...opportunities]);
      setToast("✅ تمت إضافة رسالة الفرصة بالتاريخ التلقائي");
    } else if (activeTab === "recommendations") {
      const newItem: Recommendation = {
        id: `rec-${id}`,
        title: text,
        category: "توصية تنفيذية",
        priority: "high",
        impact: "تحسين الأداء",
        date: autoDate,
        description: text,
        status: "active",
      };
      setRecommendations([newItem, ...recommendations]);
      setToast("✅ تمت إضافة رسالة التوصية بالتاريخ التلقائي");
    }

    setMessageInput("");
  };

  // Delete message
  const handleDelete = (id: string) => {
    if (activeTab === "partnerships") {
      setPartnerships(partnerships.filter((item) => item.id !== id));
    } else if (activeTab === "contracts") {
      setContracts(contracts.filter((item) => item.id !== id));
    } else if (activeTab === "opportunities") {
      setOpportunities(opportunities.filter((item) => item.id !== id));
    } else if (activeTab === "recommendations") {
      setRecommendations(recommendations.filter((item) => item.id !== id));
    }
    setToast("🗑️ تم حذف الرسالة");
  };

  // Tab configurations
  const TAB_META = {
    partnerships: {
      title: "الشراكات",
      icon: Handshake,
      color: "blue",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      btnClass: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/25",
      placeholder: "اكتب رسالة الشراكة هنا بكل حرية... (مثال: اتفاق تعاون جديد مع مجموعة الحلول المتقدمة)",
      items: partnerships.map((p) => ({
        id: p.id,
        text: p.name,
        date: (p as any).date || todayDate,
      })),
    },
    contracts: {
      title: "التعاقدات",
      icon: FileCheck2,
      color: "emerald",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      btnClass: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25",
      placeholder: "اكتب رسالة التعاقد هنا بكل حرية... (مثال: بدء تفعيل المرحلة الأولى من العقد التشغيلي)",
      items: contracts.map((c) => ({
        id: c.id,
        text: c.title,
        date: (c as any).date || c.startDate || todayDate,
      })),
    },
    opportunities: {
      title: "الفرص",
      icon: TrendingUp,
      color: "amber",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      btnClass: "bg-amber-500 hover:bg-amber-400 shadow-amber-500/25",
      placeholder: "اكتب رسالة الفرصة هنا بكل حرية... (مثال: مسار استثماري جديد مطروح في قطاع التكنولوجيا)",
      items: opportunities.map((o) => ({
        id: o.id,
        text: o.title,
        date: (o as any).date || o.expectedClose || todayDate,
      })),
    },
    recommendations: {
      title: "التوصيات",
      icon: Sparkles,
      color: "purple",
      badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      btnClass: "bg-purple-600 hover:bg-purple-500 shadow-purple-500/25",
      placeholder: "اكتب رسالة التوصية هنا بكل حرية... (مثال: يُوصى بتحديث بروتوكول الأمان وفتح قنوات التحصيل)",
      items: recommendations.map((r) => ({
        id: r.id,
        text: r.title,
        date: r.date || todayDate,
      })),
    },
  };

  const currentMeta = TAB_META[activeTab];
  const CurrentIcon = currentMeta.icon;

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            شغلي — الشؤون وإدارة الأعمال
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            إدخال مفتوح على هيئة رسالة مع تاريخ تلقائي — تظهر مباشرة عند العميل في خانتي التوصيات والفرص
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>التاريخ أوتوماتيك: {todayDate}</span>
        </div>
      </div>

      {/* Tabs Switcher: الشراكات، التعاقدات، الفرص، التوصيات */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-white/5">
        <button
          onClick={() => setActiveTab("partnerships")}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl py-3 text-xs md:text-sm font-bold transition-all ${
            activeTab === "partnerships"
              ? "bg-white text-blue-600 shadow-md dark:bg-slate-800 dark:text-blue-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Handshake size={16} />
          <span>الشراكات ({partnerships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("contracts")}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl py-3 text-xs md:text-sm font-bold transition-all ${
            activeTab === "contracts"
              ? "bg-white text-emerald-600 shadow-md dark:bg-slate-800 dark:text-emerald-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <FileCheck2 size={16} />
          <span>التعاقدات ({contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("opportunities")}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl py-3 text-xs md:text-sm font-bold transition-all ${
            activeTab === "opportunities"
              ? "bg-white text-amber-600 shadow-md dark:bg-slate-800 dark:text-amber-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <TrendingUp size={16} />
          <span>الفرص ({opportunities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("recommendations")}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl py-3 text-xs md:text-sm font-bold transition-all ${
            activeTab === "recommendations"
              ? "bg-white text-purple-600 shadow-md dark:bg-slate-800 dark:text-purple-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Sparkles size={16} />
          <span>التوصيات ({recommendations.length})</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* صندوق الإدخال المفتوح (رسالة فقط + التاريخ أوتوماتيك) */}
      {/* =================================================================== */}
      <form
        onSubmit={handleSendMessage}
        className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white">
              <CurrentIcon size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                إضافة رسالة جديدة إلى: {currentMeta.title}
              </h3>
              <span className="text-[11px] text-slate-400">
                مدخل مفتوح — التاريخ يتم تسجيله تلقائياً
              </span>
            </div>
          </div>

          {/* التاريخ الأوتوماتيكي في قلب المدخلات */}
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Calendar size={13} className="text-blue-500" />
            <span>التاريخ (أوتوماتيك): {todayDate}</span>
          </div>
        </div>

        {/* Textarea مفتوحة */}
        <textarea
          rows={3}
          required
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder={currentMeta.placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-slate-900"
        />

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            تصل الرسالة فوراً إلى صفحة العميل في قلبها كلمة «اهتم»
          </span>

          <button
            type="submit"
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 ${currentMeta.btnClass}`}
          >
            <Send size={15} />
            <span>إرسال الرسالة</span>
          </button>
        </div>
      </form>

      {/* =================================================================== */}
      {/* قائمة الرسائل المضافة (مع التاريخ الأوتوماتيكي وزر الحذف) */}
      {/* =================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>الرسائل المسجلة في {currentMeta.title}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${currentMeta.badgeClass}`}>
              {currentMeta.items.length}
            </span>
          </h3>
          <span className="text-xs text-slate-400">مرتبة من الأحدث إلى الأقدم</span>
        </div>

        {currentMeta.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-xs text-slate-400 dark:border-white/10">
            لا توجد رسائل مضافة حتى الآن في هذا القسم
          </div>
        ) : (
          <div className="space-y-3">
            {currentMeta.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900/80"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    <CurrentIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                      {item.text}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={11} />
                      <span>التاريخ المسجل: {item.date}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="shrink-0 rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition"
                  title="حذف الرسالة"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 start-4 z-[60] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl dark:bg-emerald-600">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
