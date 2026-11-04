"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Handshake,
  FileCheck2,
  TrendingUp,
  Search,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  SEED_PARTNERSHIPS,
  SEED_CONTRACTS,
  SEED_OPPORTUNITIES,
  PARTNERSHIP_TYPES,
  PARTNERSHIP_STATUS,
  CONTRACT_STATUS,
  STAGE_CONFIG,
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
  KEY_PARTNERSHIPS,
  KEY_CONTRACTS,
  KEY_OPPORTUNITIES,
  KEY_RECOMMENDATIONS,
} from "@/lib/portal-sync";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const money = (n: number) =>
  n.toLocaleString("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });

type ActiveSection = "partnerships" | "contracts" | "opportunities" | "recommendations";

export default function PortalWorkClient() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveSection>("partnerships");
  const [searchQuery, setSearchQuery] = useState("");

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

  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [adminRecs, setAdminRecs] = useState<Recommendation[]>([]);

  const loadData = () => {
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
  };

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
  }, []);

  const recommendations: Recommendation[] = useMemo(() => {
    return getAllRecommendations(adminRecs, partnerships, contracts, opportunities);
  }, [adminRecs, partnerships, contracts, opportunities]);

  // Filtered items based on search query
  const filteredPartnerships = useMemo(() => {
    if (!searchQuery.trim()) return partnerships;
    const q = searchQuery.toLowerCase();
    return partnerships.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.field.toLowerCase().includes(q) ||
        (p.contact && p.contact.toLowerCase().includes(q))
    );
  }, [partnerships, searchQuery]);

  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) return contracts;
    const q = searchQuery.toLowerCase();
    return contracts.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.party.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [contracts, searchQuery]);

  const filteredOpportunities = useMemo(() => {
    if (!searchQuery.trim()) return opportunities;
    const q = searchQuery.toLowerCase();
    return opportunities.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.client.toLowerCase().includes(q) ||
        (o.notes && o.notes.toLowerCase().includes(q))
    );
  }, [opportunities, searchQuery]);

  const filteredRecommendations = useMemo(() => {
    if (!searchQuery.trim()) return recommendations;
    const q = searchQuery.toLowerCase();
    return recommendations.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.impact.toLowerCase().includes(q)
    );
  }, [recommendations, searchQuery]);

  // High-level statistics
  const stats = useMemo(() => {
    const totalP = partnerships.length;
    const activeP = partnerships.filter((p) => p.status === "active").length;

    const totalC = contracts.length;
    const totalCValue = contracts.reduce((acc, c) => acc + (c.value || 0), 0);
    const avgCProgress =
      totalC > 0 ? Math.round(contracts.reduce((acc, c) => acc + (c.progress || 0), 0) / totalC) : 0;

    const totalO = opportunities.length;
    const totalOValue = opportunities.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);

    const totalR = recommendations.length;
    const activeR = recommendations.filter((r) => r.status === "active").length;

    return { totalP, activeP, totalC, totalCValue, avgCProgress, totalO, totalOValue, totalR, activeR };
  }, [partnerships, contracts, opportunities, recommendations]);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 border border-blue-500/20">
            <Sparkles size={12} />
            <span>سجلات الأعمال والخدمات (اطلاع فقط)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            شغلي — الشراكات، التعاقدات، الفرص والتوصيات
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            سجلات ومؤشرات حية مربوطة مباشرة بمدخلات الإدارة المركزية
          </p>
        </div>
      </div>

      {/* 4 Executive Hub Cards (Read-Only: Click to switch tab) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. الشراكات */}
        <div
          onClick={() => setActiveTab("partnerships")}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 ${
            activeTab === "partnerships"
              ? "border-blue-500 bg-blue-500/10 shadow-blue-500/10 ring-2 ring-blue-500/30"
              : "border-slate-200 bg-white hover:border-blue-400 dark:border-white/10 dark:bg-slate-900/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/30">
                <Handshake size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">الشراكات</h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {stats.activeP} نشطة من أصل {stats.totalP}
                </span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">
                {stats.totalP}
              </span>
              <span className="text-[10px] text-slate-400">شراكة</span>
            </div>
          </div>
        </div>

        {/* 2. التعاقدات */}
        <div
          onClick={() => setActiveTab("contracts")}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 ${
            activeTab === "contracts"
              ? "border-emerald-500 bg-emerald-500/10 shadow-emerald-500/10 ring-2 ring-emerald-500/30"
              : "border-slate-200 bg-white hover:border-emerald-400 dark:border-white/10 dark:bg-slate-900/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                <FileCheck2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">التعاقدات</h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  متوسط الإنجاز: {stats.avgCProgress}%
                </span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block truncate max-w-[100px]">
                {money(stats.totalCValue)}
              </span>
              <span className="text-[10px] text-slate-400">{stats.totalC} عقود</span>
            </div>
          </div>
        </div>

        {/* 3. الفرص */}
        <div
          onClick={() => setActiveTab("opportunities")}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 ${
            activeTab === "opportunities"
              ? "border-amber-500 bg-amber-500/10 shadow-amber-500/10 ring-2 ring-amber-500/30"
              : "border-slate-200 bg-white hover:border-amber-400 dark:border-white/10 dark:bg-slate-900/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">الفرص</h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {stats.totalO} فرص ومشاريع
                </span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 block truncate max-w-[100px]">
                {money(stats.totalOValue)}
              </span>
              <span className="text-[10px] text-slate-400">قيمة تقديرية</span>
            </div>
          </div>
        </div>

        {/* 4. التوصيات */}
        <div
          onClick={() => setActiveTab("recommendations")}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 ${
            activeTab === "recommendations"
              ? "border-purple-500 bg-purple-500/10 shadow-purple-500/10 ring-2 ring-purple-500/30"
              : "border-slate-200 bg-white hover:border-purple-400 dark:border-white/10 dark:bg-slate-900/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/30">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">التوصيات</h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {stats.activeR} نشطة للمتابعة
                </span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-xs font-black text-purple-600 dark:text-purple-400 block">
                {stats.totalR}
              </span>
              <span className="text-[10px] text-slate-400">توصية حية</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1.5 dark:bg-white/5">
          <button
            onClick={() => setActiveTab("partnerships")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "partnerships"
                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Handshake size={14} />
            <span>الشراكات ({filteredPartnerships.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("contracts")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "contracts"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <FileCheck2 size={14} />
            <span>التعاقدات ({filteredContracts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("opportunities")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "opportunities"
                ? "bg-white text-amber-600 shadow-sm dark:bg-slate-800 dark:text-amber-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <TrendingUp size={14} />
            <span>الفرص ({filteredOpportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "recommendations"
                ? "bg-white text-purple-600 shadow-sm dark:bg-slate-800 dark:text-purple-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Sparkles size={14} />
            <span>التوصيات ({filteredRecommendations.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو التفاصيل..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pe-9 ps-3 text-xs outline-none transition focus:border-blue-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: الشراكات (Read-Only) */}
      {/* =================================================================== */}
      {activeTab === "partnerships" && (
        <div className="space-y-4">
          {filteredPartnerships.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-white/10">
              <Handshake className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد شراكات مسجلة تطابق البحث
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPartnerships.map((p) => {
                const statusMeta = PARTNERSHIP_STATUS[p.status] || {
                  label: p.status,
                  style: "bg-slate-100 text-slate-600",
                };
                const typeLabel = PARTNERSHIP_TYPES[p.type] || p.type;

                return (
                  <div
                    key={p.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          {typeLabel}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusMeta.style}`}>
                          {statusMeta.label}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {p.field}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-white/5 pt-2">
                        <span>مسؤول التواصل:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{p.contact}</span>
                      </div>

                      {p.notes && (
                        <p className="mt-3 rounded-xl bg-slate-50 dark:bg-white/5 p-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {p.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-blue-500" />
                        سجل معتمد
                      </span>
                      <span className="font-mono text-[10px]">ID: {p.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: التعاقدات (Read-Only) */}
      {/* =================================================================== */}
      {activeTab === "contracts" && (
        <div className="space-y-4">
          {filteredContracts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-white/10">
              <FileCheck2 className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد تعاقدات مسجلة تطابق البحث
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContracts.map((c) => {
                const statusMeta = CONTRACT_STATUS[c.status] || {
                  label: c.status,
                  style: "bg-slate-100 text-slate-600",
                };

                return (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          الطرف: {c.party}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusMeta.style}`}>
                          {statusMeta.label}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {c.title}
                      </h3>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-500">القيمة التعاقدية:</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {money(c.value)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500">نسبة الإنجاز</span>
                          <span className="font-bold text-slate-900 dark:text-white">{c.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        <span>{c.startDate} ← {c.endDate}</span>
                      </div>

                      {c.notes && (
                        <p className="mt-3 rounded-xl bg-slate-50 dark:bg-white/5 p-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {c.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        اتفاقية سارية
                      </span>
                      <span className="font-mono text-[10px]">ID: {c.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: الفرص (Read-Only) */}
      {/* =================================================================== */}
      {activeTab === "opportunities" && (
        <div className="space-y-4">
          {filteredOpportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-white/10">
              <TrendingUp className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد فرص تجارية مسجلة تطابق البحث
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOpportunities.map((op) => {
                const stageMeta = STAGE_CONFIG[op.stage] || {
                  label: op.stage,
                  style: "bg-slate-100 text-slate-600",
                };

                return (
                  <div
                    key={op.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-amber-500/30 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          العميل: {op.client}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${stageMeta.style}`}>
                          {stageMeta.label}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {op.title}
                      </h3>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-500">القيمة المتوقعة:</span>
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                          {money(op.estimatedValue)}
                        </span>
                      </div>

                      {/* Probability */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500">احتمالية الإغلاق</span>
                          <span className="font-bold text-slate-900 dark:text-white">{op.probability}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${op.probability}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        <span>الإغلاق المتوقع: {op.expectedClose}</span>
                      </div>

                      {op.notes && (
                        <p className="mt-3 rounded-xl bg-slate-50 dark:bg-white/5 p-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {op.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-amber-500" />
                        فرصة مسجلة
                      </span>
                      <span className="font-mono text-[10px]">ID: {op.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: التوصيات (Read-Only) */}
      {/* =================================================================== */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          {filteredRecommendations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-white/10">
              <Sparkles className="mx-auto text-purple-400 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد توصيات مسجلة تطابق البحث
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecommendations.map((r) => {
                const priorityCfg = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.normal;
                const statusCfg = REC_STATUS_CONFIG[r.status] || REC_STATUS_CONFIG.active;

                return (
                  <div
                    key={r.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-purple-500/30 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="inline-block rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                          {r.category}
                        </span>
                        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${priorityCfg.style}`}>
                          {priorityCfg.label}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                        {r.title}
                      </h3>

                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {r.description}
                      </p>

                      {r.impact && (
                        <div className="mt-3 rounded-xl bg-purple-50/60 p-2 text-xs dark:bg-purple-950/20">
                          <span className="font-bold text-purple-700 dark:text-purple-300">الأثر: </span>
                          <span className="text-slate-600 dark:text-slate-300">{r.impact}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusCfg.style}`}>
                        {statusCfg.label}
                      </span>
                      <span className="font-mono text-[10px]">{r.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
