"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  Search,
  Clock,
  CheckCircle2,
  Lightbulb,
  Target,
  RefreshCw,
  FileCheck2,
  Handshake,
} from "lucide-react";
import {
  getAdminPartnerships,
  getAdminContracts,
  getAdminOpportunities,
  generateRecommendationsFromAdminInputs,
  KEY_PARTNERSHIPS,
  KEY_CONTRACTS,
  KEY_OPPORTUNITIES,
} from "@/lib/portal-sync";
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG as REC_STATUS_CONFIG,
  type Recommendation,
} from "@/lib/recommendations";
import {
  STAGE_CONFIG,
  type Opportunity,
  type Partnership,
  type ContractItem,
} from "@/lib/work-three";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const money = (n: number) =>
  n.toLocaleString("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });

export default function PortalHomeClient() {
  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Live admin inputs state
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  // Search and filter states
  const [recSearch, setRecSearch] = useState("");
  const [oppSearch, setOppSearch] = useState("");
  const [activeRecFilter, setActiveRecFilter] = useState<string>("all");
  const [activeOppFilter, setActiveOppFilter] = useState<string>("all");

  // Load and synchronize live admin inputs
  const syncFromAdminInputs = useCallback(async () => {
    if (typeof window === "undefined") return;

    // 1. Load from local admin storage
    const currentP = getAdminPartnerships();
    const currentC = getAdminContracts();
    const currentO = getAdminOpportunities();

    setPartnerships(currentP);
    setContracts(currentC);
    setOpportunities(currentO);

    // 2. If Supabase is available, sync Supabase contracts
    if (isSupabaseConfigured) {
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
        console.warn("Supabase portal sync note:", err);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    syncFromAdminInputs();

    // Listen to real-time storage changes when admin adds/edits data
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === KEY_PARTNERSHIPS ||
        e.key === KEY_CONTRACTS ||
        e.key === KEY_OPPORTUNITIES
      ) {
        syncFromAdminInputs();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("opekia_data_updated", syncFromAdminInputs);
    window.addEventListener("focus", syncFromAdminInputs);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("opekia_data_updated", syncFromAdminInputs);
      window.removeEventListener("focus", syncFromAdminInputs);
    };
  }, [syncFromAdminInputs]);

  // Dynamically generated recommendations connected directly to admin's partnerships, contracts, & opportunities
  const recommendations: Recommendation[] = useMemo(() => {
    return generateRecommendationsFromAdminInputs(partnerships, contracts, opportunities);
  }, [partnerships, contracts, opportunities]);

  // Filter recommendations
  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(recSearch.toLowerCase()) ||
        r.category.toLowerCase().includes(recSearch.toLowerCase()) ||
        r.description.toLowerCase().includes(recSearch.toLowerCase());
      const matchFilter = activeRecFilter === "all" || r.status === activeRecFilter;
      return matchSearch && matchFilter;
    });
  }, [recommendations, recSearch, activeRecFilter]);

  // Filter opportunities (live from admin inputs)
  const filteredOpps = useMemo(() => {
    return opportunities.filter((o) => {
      const matchSearch =
        o.title.toLowerCase().includes(oppSearch.toLowerCase()) ||
        o.client.toLowerCase().includes(oppSearch.toLowerCase()) ||
        (o.notes && o.notes.toLowerCase().includes(oppSearch.toLowerCase()));
      const matchFilter = activeOppFilter === "all" || o.stage === activeOppFilter;
      return matchSearch && matchFilter;
    });
  }, [opportunities, oppSearch, activeOppFilter]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await syncFromAdminInputs();
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
    <div className="w-full space-y-6">
      {/* Live Sync Status Pill */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>
            مزامنة مباشرة مع مدخلات الإدارة: (
            <strong className="text-slate-800 dark:text-slate-200">{contracts.length} تعاقدات</strong>،{" "}
            <strong className="text-slate-800 dark:text-slate-200">{partnerships.length} شراكات</strong>،{" "}
            <strong className="text-slate-800 dark:text-slate-200">{opportunities.length} فرص</strong>)
          </span>
        </div>

        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-1 hover:text-blue-500 transition text-[11px]"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin text-blue-500" : ""} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* The Two Main Sections: 1. التوصيات | 2. الفرص */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* =================================================================== */}
        {/* الخانة الأولى: التوصيات (Recommendations - Linked to Contracts & Partnerships) */}
        {/* =================================================================== */}
        <div className="flex flex-col rounded-3xl border-2 border-blue-500/30 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-blue-500/25 dark:bg-slate-900/80 transition-all hover:border-blue-500/50">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  التوصيات
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  توصيات ذكية مستخلصة من مدخلات الشراكات والتعاقدات
                </span>
              </div>
            </div>

            <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {filteredRecs.length} توصيات
            </span>
          </div>

          {/* Search & Filter */}
          <div className="pt-4 pb-2 space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={recSearch}
                onChange={(e) => setRecSearch(e.target.value)}
                placeholder="بحث في التوصيات التلقائية..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pe-9 ps-3 text-xs outline-none transition focus:border-blue-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {(
                [
                  { id: "all", label: "الكل" },
                  { id: "active", label: "نشطة" },
                  { id: "planned", label: "مخططة" },
                  { id: "completed", label: "مكتملة" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRecFilter(tab.id)}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    activeRecFilter === tab.id
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendations List (Linked directly to Admin's contracts & partnerships) */}
          <div className="mt-3 flex-1 space-y-3 overflow-y-auto max-h-[600px] pe-1">
            {filteredRecs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-white/10">
                <Lightbulb className="mx-auto text-slate-400 mb-2" size={28} />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  لا توجد توصيات تطابق معايير البحث
                </p>
              </div>
            ) : (
              filteredRecs.map((rec) => {
                const priorityMeta = PRIORITY_CONFIG[rec.priority] || {
                  label: rec.priority,
                  style: "bg-slate-100 text-slate-600",
                };
                const statusMeta = REC_STATUS_CONFIG[rec.status] || {
                  label: rec.status,
                  style: "bg-slate-100 text-slate-600",
                };

                return (
                  <div
                    key={rec.id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-white/10 dark:bg-slate-950/50"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        {rec.category.includes("تعاقد") ? (
                          <FileCheck2 size={12} />
                        ) : rec.category.includes("شراكة") ? (
                          <Handshake size={12} />
                        ) : (
                          <Sparkles size={12} />
                        )}
                        <span>{rec.category}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${priorityMeta.style}`}>
                          {priorityMeta.label}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusMeta.style}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {rec.title}
                    </h3>

                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rec.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 size={12} />
                        الأثر: {rec.impact}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{rec.date}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* الخانة الثانية: الفرص (Opportunities - Live from Admin Opportunities) */}
        {/* =================================================================== */}
        <div className="flex flex-col rounded-3xl border-2 border-amber-500/30 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-amber-500/25 dark:bg-slate-900/80 transition-all hover:border-amber-500/50">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  الفرص
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  الصفقات والمشاريع المعتمدة والمدخلة بواسطة الإدارة
                </span>
              </div>
            </div>

            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {filteredOpps.length} فرص
            </span>
          </div>

          {/* Search & Filter */}
          <div className="pt-4 pb-2 space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={oppSearch}
                onChange={(e) => setOppSearch(e.target.value)}
                placeholder="بحث في الفرص المدخلة..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pe-9 ps-3 text-xs outline-none transition focus:border-amber-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {(
                [
                  { id: "all", label: "الكل" },
                  { id: "lead", label: "استكشاف" },
                  { id: "proposal", label: "عرض مقدم" },
                  { id: "negotiation", label: "تفاوض" },
                  { id: "won", label: "مكتسبة" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveOppFilter(tab.id)}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    activeOppFilter === tab.id
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities List (Direct live admin inputs) */}
          <div className="mt-3 flex-1 space-y-3 overflow-y-auto max-h-[600px] pe-1">
            {filteredOpps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-white/10">
                <Target className="mx-auto text-slate-400 mb-2" size={28} />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  لا توجد فرص مسجلة تطابق البحث
                </p>
              </div>
            ) : (
              filteredOpps.map((opp) => {
                const stageMeta = STAGE_CONFIG[opp.stage] || {
                  label: opp.stage,
                  style: "bg-slate-100 text-slate-600",
                };

                return (
                  <div
                    key={opp.id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:border-amber-400 hover:shadow-md dark:border-white/10 dark:bg-slate-950/50"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        الجهة: {opp.client}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${stageMeta.style}`}>
                        {stageMeta.label}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {opp.title}
                    </h3>

                    {/* Financial Value */}
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500">القيمة التقديرية:</span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {money(opp.estimatedValue)}
                      </span>
                    </div>

                    {/* Probability */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400">احتمالية الإغلاق</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {opp.probability}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                          style={{ width: `${opp.probability}%` }}
                        />
                      </div>
                    </div>

                    {opp.notes && (
                      <p className="mt-2.5 rounded-xl bg-slate-50 dark:bg-white/5 p-2 text-xs text-slate-500 dark:text-slate-400">
                        {opp.notes}
                      </p>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>الإغلاق المتوقع: {opp.expectedClose}</span>
                      </div>
                      <span className="font-mono text-[10px]">ID: {opp.id}</span>
                    </div>
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
