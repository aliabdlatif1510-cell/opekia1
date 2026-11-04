"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Handshake,
  FileCheck2,
  TrendingUp,
  Search,
  DollarSign,
  Calendar,
  Building2,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Layers,
  Phone,
  HelpCircle,
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
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const KEY_P = "opekia_work_partnerships";
const KEY_C = "opekia_work_contracts_v2";
const KEY_O = "opekia_work_opportunities";

const money = (n: number) =>
  n.toLocaleString("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });

type ActiveSection = "partnerships" | "contracts" | "opportunities";

export default function PortalWorkClient() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveSection>("partnerships");
  const [searchQuery, setSearchQuery] = useState("");

  // Listen to URL query params for direct tab selection
  useEffect(() => {
    if (!searchParams) return;
    const tab = searchParams.get("tab");
    if (tab === "partnerships" || tab === "contracts" || tab === "opportunities") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

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
      } catch (e) {
        console.error("Failed to load work data:", e);
      }
    }
  }, []);

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

  // Statistics
  const stats = useMemo(() => {
    const totalP = partnerships.length;
    const activeP = partnerships.filter((p) => p.status === "active").length;

    const totalC = contracts.length;
    const totalCValue = contracts.reduce((acc, c) => acc + (c.value || 0), 0);
    const avgCProgress =
      totalC > 0 ? Math.round(contracts.reduce((acc, c) => acc + (c.progress || 0), 0) / totalC) : 0;

    const totalO = opportunities.length;
    const totalOValue = opportunities.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);

    return { totalP, activeP, totalC, totalCValue, avgCProgress, totalO, totalOValue };
  }, [partnerships, contracts, opportunities]);

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
            شغلي — الشراكات، التعاقدات والفرص
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            تابع تفاصيل العقود والمشاريع المعتمدة في حسابك بكل دقة، بدون أي تعقيد.
          </p>
        </div>
      </div>

      {/* 3 Executive Hub Cards (Read-Only: Click to switch tab, no create buttons) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-white/5">
          <button
            onClick={() => setActiveTab("partnerships")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
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
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
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
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "opportunities"
                ? "bg-white text-amber-600 shadow-sm dark:bg-slate-800 dark:text-amber-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <TrendingUp size={14} />
            <span>الفرص ({filteredOpportunities.length})</span>
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

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={13} className="text-slate-400" />
                          <span>مجال العمل: {p.field}</span>
                        </div>
                        {p.contact && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-400" />
                            <span>المسؤول: {p.contact}</span>
                          </div>
                        )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          الطرف المنفذ: {c.party}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusMeta.style}`}>
                          {statusMeta.label}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {c.title}
                      </h3>

                      {/* Financial Value */}
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-500">القيمة المالية للعقد:</span>
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
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>البدء: {c.startDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>الانتهاء: {c.endDate}</span>
                        </div>
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
                        عقد رسمي معتمد
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
                لا توجد فرص مسجلة تطابق البحث
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOpportunities.map((o) => {
                const stageMeta = STAGE_CONFIG[o.stage] || {
                  label: o.stage,
                  style: "bg-slate-100 text-slate-600",
                };

                return (
                  <div
                    key={o.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-amber-500/30 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          العميل: {o.client}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${stageMeta.style}`}>
                          {stageMeta.label}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {o.title}
                      </h3>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-500">القيمة المتوقعة:</span>
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                          {money(o.estimatedValue)}
                        </span>
                      </div>

                      {/* Probability */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500">احتمالية الإغلاق</span>
                          <span className="font-bold text-slate-900 dark:text-white">{o.probability}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${o.probability}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        <span>الإغلاق المتوقع: {o.expectedClose}</span>
                      </div>

                      {o.notes && (
                        <p className="mt-3 rounded-xl bg-slate-50 dark:bg-white/5 p-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {o.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-amber-500" />
                        فرصة مسجلة
                      </span>
                      <span className="font-mono text-[10px]">ID: {o.id}</span>
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
