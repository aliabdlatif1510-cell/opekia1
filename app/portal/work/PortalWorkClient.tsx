"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  FileCheck2,
  Handshake,
  Check,
  RefreshCw,
  BellRing,
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
            رسائل التوصيات والفرص الموجهة إليك من الإدارة
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
        {/* الخانة الأولى: التوصيات (رسالة بسيطة + اهتم) */}
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
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-purple-400 dark:border-white/10 dark:bg-slate-950/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Sparkles size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                          {rec.title}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {rec.category || "توصية تنفيذية"}
                        </span>
                      </div>
                    </div>

                    {/* في قلب الرسالة: اهتم */}
                    <button
                      type="button"
                      onClick={() => toggleInterest(rec.id)}
                      className={`shrink-0 flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-black transition-all duration-200 ${
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
        {/* الخانة الثانية: الفرص (رسالة بسيطة + اهتم) */}
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
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-amber-400 dark:border-white/10 dark:bg-slate-950/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
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
                        <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                          {item.title}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {item.sourceLabel} — {item.counterparty}
                        </span>
                      </div>
                    </div>

                    {/* في قلب الرسالة: اهتم */}
                    <button
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`shrink-0 flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-black transition-all duration-200 ${
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
    </div>
  );
}
