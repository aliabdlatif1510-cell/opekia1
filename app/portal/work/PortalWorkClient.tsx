"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  FileCheck2,
  Handshake,
  Check,
  RefreshCw,
  Calendar,
  Eye,
  X,
} from "lucide-react";
import {
  getAdminPartnerships,
  getAdminContracts,
  getAdminOpportunities,
  getAdminRecommendations,
  getAllRecommendations,
  getUnifiedClientOpportunities,
  type ClientOpportunityItem,
} from "@/lib/portal-sync";
import { type Recommendation } from "@/lib/recommendations";
import { type Partnership, type ContractItem, type Opportunity } from "@/lib/work-three";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const KEY_INTERESTED = "opekia_client_interested";

interface OpenMessageModalData {
  id: string;
  title: string;
  content: string;
  date: string;
  categoryLabel: string;
  badgeStyle: string;
  colorType: "purple" | "amber" | "emerald" | "blue";
  counterparty?: string;
  valueDisplay?: string;
}

export default function PortalWorkClient() {
  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Live admin inputs state
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [adminRecs, setAdminRecs] = useState<Recommendation[]>([]);

  // Client "اهتم" state (stored locally)
  const [interestedMap, setInterestedMap] = useState<Record<string, boolean>>({});

  // Active modal message to read full details
  const [activeMessage, setActiveMessage] = useState<OpenMessageModalData | null>(null);

  const loadData = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        setPartnerships(getAdminPartnerships());
        setContracts(getAdminContracts());
        setOpportunities(getAdminOpportunities());
        setAdminRecs(getAdminRecommendations());

        const savedInterest = localStorage.getItem(KEY_INTERESTED);
        if (savedInterest) {
          setInterestedMap(JSON.parse(savedInterest));
        }
      } catch (e) {
        console.error("Failed to load work data:", e);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("opekia_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    // Sync Supabase contracts if configured
    if (isSupabaseConfigured) {
      (async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: dbContracts } = await supabase
              .from("contracts")
              .select("*")
              .eq("user_id", user.id);

            if (dbContracts && dbContracts.length > 0) {
              const mappedContracts: ContractItem[] = dbContracts.map((dc: any) => ({
                id: dc.id,
                title: dc.title,
                party: dc.partner || "طرف متعاقد",
                value: Number(dc.value) || 0,
                startDate: dc.start_date || "",
                endDate: dc.end_date || "",
                progress: Number(dc.progress) || 0,
                status: (dc.status as "active" | "review" | "expired") || "active",
                notes: dc.notes || "",
              }));
              setContracts(mappedContracts);
            }
          }
        } catch (err) {
          console.warn("Supabase portal contracts note:", err);
        }
      })();
    }

    return () => {
      window.removeEventListener("opekia_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [loadData]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMessage(null);
      }
    };
    if (activeMessage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMessage]);

  // Toggle "اهتم" for any recommendation or opportunity
  const toggleInterest = (id: string) => {
    setInterestedMap((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(KEY_INTERESTED, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Recommendations
  const recommendations: Recommendation[] = useMemo(() => {
    return getAllRecommendations(adminRecs, partnerships, contracts, opportunities);
  }, [adminRecs, partnerships, contracts, opportunities]);

  // Opportunities (Unified from deals, contracts, and partnerships)
  const unifiedOpportunities: ClientOpportunityItem[] = useMemo(() => {
    return getUnifiedClientOpportunities(opportunities, contracts, partnerships);
  }, [opportunities, contracts, partnerships]);

  // Open Recommendation in Modal
  const openRecommendation = (rec: Recommendation) => {
    setActiveMessage({
      id: rec.id,
      title: rec.title,
      content: rec.description || rec.title,
      date: rec.date || "2026-11-04",
      categoryLabel: rec.category || "توصية تنفيذية",
      badgeStyle: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      colorType: "purple",
    });
  };

  // Open Opportunity in Modal
  const openOpportunity = (item: ClientOpportunityItem) => {
    setActiveMessage({
      id: item.id,
      title: item.title,
      content: item.notes || item.title,
      date: item.date || "2026-11-04",
      categoryLabel: item.sourceLabel,
      badgeStyle: item.sourceBadgeStyle,
      colorType: item.sourceColor,
      counterparty: item.counterparty,
      valueDisplay: item.valueDisplay,
    });
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            شغلي
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            رسائل التوصيات والفرص الموجهة إليك — انقر على أي رسالة لفتحها وقراءتها بالكامل
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin text-blue-500" : ""} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Two Simple Message Columns: التوصيات & الفرص */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* =================================================================== */}
        {/* الخانة الأولى: التوصيات (قابلة للفتح + عنوان + اهتم) */}
        {/* =================================================================== */}
        <div className="rounded-3xl border border-purple-500/20 bg-white/90 p-5 shadow-lg backdrop-blur-xl dark:border-purple-500/20 dark:bg-slate-900/80">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500 text-white shadow-sm shadow-purple-500/30">
                <Sparkles size={18} />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                التوصيات
              </h2>
            </div>
            <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
              {recommendations.length} رسائل
            </span>
          </div>

          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-white/10">
                لا توجد توصيات حالياً
              </div>
            ) : (
              recommendations.map((rec) => {
                const isInterested = !!interestedMap[rec.id];

                return (
                  <div
                    key={rec.id}
                    onClick={() => openRecommendation(rec)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-purple-400 hover:shadow-md cursor-pointer dark:border-white/10 dark:bg-slate-950/60"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mt-0.5 group-hover:scale-105 transition-transform">
                        <Sparkles size={16} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors line-clamp-2">
                          {rec.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {rec.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span className="rounded-md bg-purple-500/10 px-2 py-0.5 font-bold text-purple-600 dark:text-purple-400">
                            {rec.category || "توصية تنفيذية"}
                          </span>
                          <span>•</span>
                          <span>📅 {rec.date}</span>
                          <span>•</span>
                          <span className="text-purple-600 font-bold inline-flex items-center gap-1 group-hover:underline">
                            <Eye size={12} />
                            <span>فتح الرسالة</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* زر اهتم في قلب الرسالة */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleInterest(rec.id);
                      }}
                      className={`shrink-0 self-end sm:self-center flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all duration-200 ${
                        isInterested
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                          : "bg-purple-600 text-white shadow-md shadow-purple-500/25 hover:bg-purple-500 active:scale-95"
                      }`}
                    >
                      {isInterested ? (
                        <>
                          <Check size={13} />
                          <span>تم الاهتمام</span>
                        </>
                      ) : (
                        <span>اهتم</span>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* الخانة الثانية: الفرص (قابلة للفتح + عنوان + اهتم) */}
        {/* =================================================================== */}
        <div className="rounded-3xl border border-amber-500/20 bg-white/90 p-5 shadow-lg backdrop-blur-xl dark:border-amber-500/20 dark:bg-slate-900/80">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
                <TrendingUp size={18} />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                الفرص
              </h2>
            </div>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              {unifiedOpportunities.length} رسائل
            </span>
          </div>

          <div className="space-y-3">
            {unifiedOpportunities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-white/10">
                لا توجد فرص حالياً
              </div>
            ) : (
              unifiedOpportunities.map((item) => {
                const isInterested = !!interestedMap[item.id];
                const isContract = item.sourceType === "contract";
                const isPartnership = item.sourceType === "partnership";

                return (
                  <div
                    key={item.id}
                    onClick={() => openOpportunity(item)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-amber-400 hover:shadow-md cursor-pointer dark:border-white/10 dark:bg-slate-950/60"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5 group-hover:scale-105 transition-transform ${
                          isContract
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : isPartnership
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isContract ? (
                          <FileCheck2 size={16} />
                        ) : isPartnership ? (
                          <Handshake size={16} />
                        ) : (
                          <TrendingUp size={16} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {item.notes}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span
                            className={`rounded-md px-2 py-0.5 font-bold border ${item.sourceBadgeStyle}`}
                          >
                            {item.sourceLabel}
                          </span>
                          <span>•</span>
                          <span>📅 {item.date}</span>
                          <span>•</span>
                          <span className="text-amber-600 font-bold inline-flex items-center gap-1 group-hover:underline">
                            <Eye size={12} />
                            <span>فتح الرسالة</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* زر اهتم في قلب الرسالة */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleInterest(item.id);
                      }}
                      className={`shrink-0 self-end sm:self-center flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all duration-200 ${
                        isInterested
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                          : "bg-amber-500 text-white shadow-md shadow-amber-500/25 hover:bg-amber-400 active:scale-95"
                      }`}
                    >
                      {isInterested ? (
                        <>
                          <Check size={13} />
                          <span>تم الاهتمام</span>
                        </>
                      ) : (
                        <span>اهتم</span>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* نافذة قراءة الرسالة المنبثقة (Modal) مع زر "اهتم" وجميع التفاصيل */}
      {/* =================================================================== */}
      {activeMessage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveMessage(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl dark:border-white/10 dark:bg-slate-900 animate-in zoom-in-95 duration-200"
          >
            {/* Header: التصنيف والتاريخ وزر الإغلاق */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <span className={`rounded-xl px-3 py-1 text-xs font-bold border ${activeMessage.badgeStyle}`}>
                  {activeMessage.categoryLabel}
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <Calendar size={13} className="text-blue-500" />
                  <span>التاريخ: {activeMessage.date}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveMessage(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition"
                aria-label="إغلاق النافذة"
              >
                <X size={18} />
              </button>
            </div>

            {/* Title: عنوان الرسالة المسجل من الأدمن */}
            <div className="mt-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                عنوان الرسالة
              </span>
              <h2 className="mt-1 text-lg md:text-xl font-black text-slate-900 dark:text-white leading-snug">
                {activeMessage.title}
              </h2>
            </div>

            {/* Body: محتوى وتفاصيل الرسالة */}
            <div className="mt-5 rounded-2xl bg-slate-50 p-5 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                محتوى وتفاصيل الرسالة
              </span>
              <p className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
                {activeMessage.content || "لا توجد تفاصيل إضافية."}
              </p>

              {activeMessage.counterparty && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>الطرف / الجهة: <strong className="text-slate-800 dark:text-white">{activeMessage.counterparty}</strong></span>
                  {activeMessage.valueDisplay && activeMessage.valueDisplay !== "0" && (
                    <span>القيمة: <strong className="text-slate-800 dark:text-white">{activeMessage.valueDisplay}</strong></span>
                  )}
                </div>
              )}
            </div>

            {/* Actions: زر "اهتم" الكبير وزر "إغلاق" */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => toggleInterest(activeMessage.id)}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-6 text-sm font-black transition-all duration-200 shadow-md ${
                  interestedMap[activeMessage.id]
                    ? "bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600"
                    : activeMessage.colorType === "purple"
                    ? "bg-purple-600 text-white shadow-purple-500/25 hover:bg-purple-500"
                    : "bg-amber-500 text-white shadow-amber-500/25 hover:bg-amber-400"
                }`}
              >
                {interestedMap[activeMessage.id] ? (
                  <>
                    <Check size={18} />
                    <span>تم تسجيل اهتمامك بنجاح ✓ (انقر للإلغاء)</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>اهتم بهذه الرسالة</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
