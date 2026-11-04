"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Handshake,
  FileCheck2,
  TrendingUp,
  Search,
  Sparkles,
  Clock,
  CheckCircle2,
  Lightbulb,
  Target,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  SEED_PARTNERSHIPS,
  SEED_CONTRACTS,
  SEED_OPPORTUNITIES,
  PARTNERSHIP_TYPES,
  PARTNERSHIP_STATUS,
  CONTRACT_STATUS,
  type Partnership,
  type ContractItem,
  type Opportunity,
} from "@/lib/work-three";
import {
  type Recommendation,
  PRIORITY_CONFIG,
  STATUS_CONFIG as REC_STATUS_CONFIG,
} from "@/lib/recommendations";
import {
  getAdminPartnerships,
  getAdminContracts,
  getAdminOpportunities,
  getAdminRecommendations,
  getAllRecommendations,
  getUnifiedClientOpportunities,
  type ClientOpportunityItem,
} from "@/lib/portal-sync";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const money = (n: number) =>
  n.toLocaleString("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });

export default function PortalWorkClient() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter state for the Two Heart Boxes
  const [recSearch, setRecSearch] = useState("");
  const [oppSearch, setOppSearch] = useState("");
  const [activeRecFilter, setActiveRecFilter] = useState<string>("all");
  const [activeOppFilter, setActiveOppFilter] = useState<string>("all");

  // Detailed records toggle
  const [showDetailedRecords, setShowDetailedRecords] = useState(false);
  const [detailedTab, setDetailedTab] = useState<"partnerships" | "contracts" | "opportunities">("partnerships");

  // Live admin inputs state
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [adminRecs, setAdminRecs] = useState<Recommendation[]>([]);

  const loadData = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        setPartnerships(getAdminPartnerships());
        setContracts(getAdminContracts());
        setOpportunities(getAdminOpportunities());
        setAdminRecs(getAdminRecommendations());
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

    // If Supabase is available, sync Supabase contracts
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

  // Unified Recommendations: Admin direct inputs + auto-synthesized
  const recommendations: Recommendation[] = useMemo(() => {
    return getAllRecommendations(adminRecs, partnerships, contracts, opportunities);
  }, [adminRecs, partnerships, contracts, opportunities]);

  // Unified Opportunities: Links ALL THREE inputs (Opportunities, Contracts, and Partnerships)
  const unifiedOpportunities: ClientOpportunityItem[] = useMemo(() => {
    return getUnifiedClientOpportunities(opportunities, contracts, partnerships);
  }, [opportunities, contracts, partnerships]);

  // Filter recommendations
  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      const matchSearch =
        !recSearch.trim() ||
        r.title.toLowerCase().includes(recSearch.toLowerCase()) ||
        r.category.toLowerCase().includes(recSearch.toLowerCase()) ||
        r.description.toLowerCase().includes(recSearch.toLowerCase());
      const matchFilter = activeRecFilter === "all" || r.status === activeRecFilter;
      return matchSearch && matchFilter;
    });
  }, [recommendations, recSearch, activeRecFilter]);

  // Filter unified opportunities
  const filteredOpps = useMemo(() => {
    return unifiedOpportunities.filter((item) => {
      const matchSearch =
        !oppSearch.trim() ||
        item.title.toLowerCase().includes(oppSearch.toLowerCase()) ||
        item.counterparty.toLowerCase().includes(oppSearch.toLowerCase()) ||
        item.notes.toLowerCase().includes(oppSearch.toLowerCase()) ||
        item.sourceLabel.toLowerCase().includes(oppSearch.toLowerCase()) ||
        item.stageLabel.toLowerCase().includes(oppSearch.toLowerCase());

      const matchFilter =
        activeOppFilter === "all" || item.sourceType === activeOppFilter;

      return matchSearch && matchFilter;
    });
  }, [unifiedOpportunities, oppSearch, activeOppFilter]);

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
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 border border-blue-500/20">
            <Sparkles size={12} />
            <span>بوابة العميل التنفيذية — شغلي</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            شغلي — التوصيات والفرص الاستثمارية
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            متابعة فورية ولحظية لجميع التوصيات والفرص الصادرة والمدخلة من قبل الإدارة
          </p>
        </div>

        {/* Live sync pill & manual refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>مزامنة مباشرة مع الإدارة</span>
          </div>

          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-blue-500" : ""} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* قلب صفحة شغل: التوصيات والفرص جنباً إلى جنب في قلب الصفحة */}
      {/* ===================================================================== */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-amber-500" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              قلب الأعمال: التوصيات والفرص
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            مرتبطة بمدخلات الشراكات، التعاقدات، والصفقات
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* =================================================================== */}
          {/* الخانة الأولى في القلب: التوصيات (Recommendations) */}
          {/* =================================================================== */}
          <div className="flex flex-col rounded-3xl border-2 border-purple-500/30 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-purple-500/25 dark:bg-slate-900/80 transition-all hover:border-purple-500/50">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    التوصيات
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    توصيات تنفيذية ذكية صادرة ومستخلصة من مدخلات الإدارة
                  </span>
                </div>
              </div>

              <span className="flex items-center gap-1 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
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
                  placeholder="بحث في التوصيات..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pe-9 ps-3 text-xs outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
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
                    className={`rounded-lg px-2.5 py-1 font-semibold transition shrink-0 ${
                      activeRecFilter === tab.id
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations List */}
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
                      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:border-purple-400 hover:shadow-md dark:border-white/10 dark:bg-slate-950/50"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
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

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rec.title}
                      </h4>

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
          {/* الخانة الثانية في القلب: الفرص (Opportunities - Connected to ALL 3 Inputs) */}
          {/* =================================================================== */}
          <div className="flex flex-col rounded-3xl border-2 border-amber-500/30 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-amber-500/25 dark:bg-slate-900/80 transition-all hover:border-amber-500/50">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    الفرص
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    جميع الفرص والتعاقدات والشراكات المربوطة بمدخلات الإدارة
                  </span>
                </div>
              </div>

              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {filteredOpps.length} فرصة
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
                  placeholder="بحث في الفرص، العقود، أو الشراكات..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pe-9 ps-3 text-xs outline-none transition focus:border-amber-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                {(
                  [
                    { id: "all", label: `الكل (${unifiedOpportunities.length})` },
                    { id: "opportunity", label: `فرص الصفقات (${opportunities.length})` },
                    { id: "contract", label: `التعاقدات (${contracts.length})` },
                    { id: "partnership", label: `الشراكات (${partnerships.length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveOppFilter(tab.id)}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition shrink-0 ${
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

            {/* Opportunities List */}
            <div className="mt-3 flex-1 space-y-3 overflow-y-auto max-h-[600px] pe-1">
              {filteredOpps.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-white/10">
                  <Target className="mx-auto text-slate-400 mb-2" size={28} />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    لا توجد مدخلات تطابق معايير البحث
                  </p>
                </div>
              ) : (
                filteredOpps.map((item) => {
                  const isContract = item.sourceType === "contract";
                  const isPartnership = item.sourceType === "partnership";

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-950/50 ${
                        isContract
                          ? "border-emerald-500/30 hover:border-emerald-500/60"
                          : isPartnership
                          ? "border-blue-500/30 hover:border-blue-500/60"
                          : "border-amber-500/30 hover:border-amber-500/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${item.sourceBadgeStyle}`}>
                          {isContract ? (
                            <FileCheck2 size={12} />
                          ) : isPartnership ? (
                            <Handshake size={12} />
                          ) : (
                            <TrendingUp size={12} />
                          )}
                          <span>{item.sourceLabel}</span>
                        </span>

                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.stageStyle}`}>
                          {item.stageLabel}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>

                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold">{item.counterpartyLabel}: </span>
                        <span>{item.counterparty}</span>
                      </div>

                      {/* Financial Value or Partnership Type */}
                      <div className="mt-2.5 flex items-center justify-between text-xs rounded-xl bg-slate-50/80 dark:bg-white/5 px-2.5 py-1.5">
                        <span className="text-slate-500">
                          {isPartnership ? "نوع التعاون:" : "القيمة المعتمدة:"}
                        </span>
                        <span
                          className={`text-sm font-black ${
                            isContract
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isPartnership
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {item.valueDisplay}
                        </span>
                      </div>

                      {/* Metric (Progress % or Probability %) */}
                      {item.metricPercentage !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-slate-400">{item.metricLabel}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {item.metricPercentage}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isContract
                                  ? "bg-emerald-500"
                                  : "bg-gradient-to-r from-amber-500 to-orange-500"
                              }`}
                              style={{ width: `${item.metricPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {item.notes && (
                        <p className="mt-2.5 rounded-xl bg-slate-50/70 dark:bg-white/5 p-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.notes}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>
                            {item.dateLabel}: {item.date}
                          </span>
                        </div>
                        <span className="font-mono text-[10px]">ID: {item.id}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* السجلات الإضافية والتفصيلية (الشراكات والتعاقدات المباشرة) */}
      {/* ===================================================================== */}
      <div className="pt-2">
        <button
          onClick={() => setShowDetailedRecords(!showDetailedRecords)}
          className="flex items-center justify-between w-full rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300"
        >
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-blue-500" />
            <span>عرض السجلات والوثائق التفصيلية (الشراكات والتعاقدات المعتمدة)</span>
          </div>
          {showDetailedRecords ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showDetailedRecords && (
          <div className="mt-4 space-y-4 rounded-3xl border border-slate-200/80 bg-white/50 p-5 dark:border-white/10 dark:bg-slate-900/40">
            {/* Detailed Subtabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setDetailedTab("partnerships")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  detailedTab === "partnerships"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400"
                }`}
              >
                🤝 الشراكات المعتمدة ({partnerships.length})
              </button>

              <button
                onClick={() => setDetailedTab("contracts")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  detailedTab === "contracts"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400"
                }`}
              >
                📄 العقود والاتفاقيات ({contracts.length})
              </button>
            </div>

            {/* Detailed Partnerships */}
            {detailedTab === "partnerships" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partnerships.map((p) => {
                  const statusMeta = PARTNERSHIP_STATUS[p.status] || {
                    label: p.status,
                    style: "bg-slate-100 text-slate-600",
                  };
                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-white/10 dark:bg-slate-950/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusMeta.style}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <p className="text-slate-500 mb-2">{p.field}</p>
                      <div className="border-t border-slate-100 dark:border-white/5 pt-2 flex justify-between text-slate-400 text-[11px]">
                        <span>مسؤول التواصل:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{p.contact}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detailed Contracts */}
            {detailedTab === "contracts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contracts.map((c) => {
                  const statusMeta = CONTRACT_STATUS[c.status] || {
                    label: c.status,
                    style: "bg-slate-100 text-slate-600",
                  };
                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-white/10 dark:bg-slate-950/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{c.title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusMeta.style}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <p className="text-slate-500 mb-2">الطرف: {c.party}</p>
                      <div className="flex justify-between font-black text-emerald-600 text-sm mb-2">
                        <span>القيمة:</span>
                        <span>{money(c.value)}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
