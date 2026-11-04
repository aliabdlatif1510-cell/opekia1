"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  Headphones,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Layers,
  Lock,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getLocalSession, type UserSession } from "@/lib/auth";
import {
  TYPE_LABEL,
  STATUS_LABEL,
  STATUS_STYLE,
  daysLeft,
  type Contract,
} from "@/lib/contracts";

interface ClientContractRecord {
  id: string;
  user_id: string;
  title: string;
  partner: string;
  type: "strategic" | "service" | "mou";
  start_date: string;
  end_date: string;
  value: number;
  progress: number;
  status: "active" | "review" | "expiring" | "expired";
  notes?: string | null;
  created_at?: string;
}

const DEMO_CLIENT_CONTRACTS: ClientContractRecord[] = [
  {
    id: "demo-c1",
    user_id: "demo-client",
    title: "عقد توريد وتشغيل منظومة الخدمات السحابية",
    partner: "مؤسسة أوبكيا للتقنية",
    type: "service",
    start_date: "2026-01-15",
    end_date: "2026-12-31",
    value: 125000,
    progress: 70,
    status: "active",
    notes: "تم استكمال المرحلة الثانية بنجاح، جاري إعداد التقرير المالي للربع الأخير.",
  },
  {
    id: "demo-c2",
    user_id: "demo-client",
    title: "اتفاقية صيانة ودعم فني سنوية شاملة",
    partner: "مجموعة أوبكيا الاستشارية",
    type: "strategic",
    start_date: "2026-03-01",
    end_date: "2027-02-28",
    value: 85000,
    progress: 45,
    status: "active",
    notes: "تشمل الخدمة الاستجابة الفورية وتحديثات الأمان الدورية على مدار الساعة.",
  },
];

export default function ClientPortalPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [contracts, setContracts] = useState<ClientContractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const loadClientData = async () => {
      setLoading(true);
      const stored = getLocalSession();
      setSession(stored);

      if (isSupabaseConfigured) {
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // Strict security: Fetch contracts strictly matching user.id
            const { data, error } = await supabase
              .from("contracts")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false });

            if (!error && data) {
              setContracts(data as ClientContractRecord[]);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn("Could not load contracts from Supabase:", e);
        }
      }

      // Fallback for preview or local mode
      if (stored?.preview) {
        setContracts(DEMO_CLIENT_CONTRACTS);
      } else {
        setContracts([]);
      }
      setLoading(false);
    };

    loadClientData();
  }, []);

  // Filtered view
  const filteredContracts = useMemo(() => {
    if (filterStatus === "all") return contracts;
    return contracts.filter((c) => c.status === filterStatus);
  }, [contracts, filterStatus]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((c) => c.status === "active").length;
    const totalValue = contracts.reduce((acc, c) => acc + (Number(c.value) || 0), 0);
    const avgProgress =
      total > 0
        ? Math.round(contracts.reduce((acc, c) => acc + (Number(c.progress) || 0), 0) / total)
        : 0;

    return { total, active, totalValue, avgProgress };
  }, [contracts]);

  const money = (n: number) =>
    n.toLocaleString("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 p-6 md:p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -start-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30 mb-3">
              <Sparkles size={13} />
              <span>مساحة العميل الخاصة | حساب موثق</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              أهلاً بك، {session?.name || "عميلنا الكريم"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-300 max-w-2xl">
              تتيح لك بوابة العميل متابعة جميع تعاقداتك، نسب الإنجاز، والمستحقات المعتمدة في منصة أوبكيا
              بكل شفافية وأمان.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/contact"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:scale-105 active:scale-95"
            >
              <Headphones size={15} />
              <span>طلب دعم أو استفسار</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards (Read-Only) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. إجمالي التعاقدات */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي التعاقدات</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileCheck2 size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <span className="text-[11px] text-slate-400">مسجلة في حسابك</span>
        </div>

        {/* 2. التعاقدات النشطة */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">التعاقدات النشطة</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.active}
          </div>
          <span className="text-[11px] text-slate-400">سارية وجاري تنفيذها</span>
        </div>

        {/* 3. متوسط الإنجاز */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">نسبة الإنجاز العامة</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {stats.avgProgress}%
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${stats.avgProgress}%` }}
            />
          </div>
        </div>

        {/* 4. القيمة المالية */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي القيمة التعاقدية</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-3 text-lg font-black text-slate-900 dark:text-white truncate">
            {money(stats.totalValue)}
          </div>
          <span className="text-[11px] text-slate-400">المبلغ الإجمالي المعتمد</span>
        </div>
      </div>

      {/* Contracts Section (Strictly Read-Only - No Add/Edit/Delete) */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                قائمة التعاقدات والخدمات المسجلة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                عرض تفصيلي للعقود والاتفاقيات الخاصة بحسابك (للقراءة والاطلاع فقط)
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-white/5">
            {(
              [
                { id: "all", label: "الكل" },
                { id: "active", label: "نشط" },
                { id: "review", label: "قيد المراجعة" },
                { id: "expiring", label: "قارب على الانتهاء" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filterStatus === tab.id
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <span className="text-xs text-slate-400 font-mono">جاري تحميل بياناتك...</span>
            </div>
          </div>
        ) : filteredContracts.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mb-4">
              <Lock size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              لا توجد تعاقدات مسجلة لحسابك حالياً
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-md">
              عند اعتماد أي شراكة أو عقد جديد لك مع إدارة أوبكيا، ستظهر تفاصيلها ونسب إنجازها ومستنداتها
              هنا تلقائياً وبشكل فوري.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <Link
                href="/dashboard/contact"
                className="rounded-xl border border-slate-300 dark:border-white/15 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                التواصل مع مدير النظام
              </Link>
            </div>
          </div>
        ) : (
          /* Contracts Grid (Strictly Read-Only - No buttons to add, edit or delete) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContracts.map((contract) => {
              const statusClass =
                STATUS_STYLE[contract.status] || "bg-slate-500/15 text-slate-500";
              const statusText = STATUS_LABEL[contract.status] || contract.status;
              const typeText = TYPE_LABEL[contract.type] || contract.type;
              const remaining = daysLeft(contract.end_date);

              return (
                <div
                  key={contract.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-500/40 hover:shadow-md dark:border-white/10 dark:bg-slate-950/50 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Title & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          {typeText}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {contract.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          الطرف المنفذ / الشريك: {contract.partner}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold shrink-0 ${statusClass}`}
                      >
                        {statusText}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          نسبة الإنجاز المعتمدة
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {contract.progress}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${contract.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Details Badges */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Calendar size={13} className="text-slate-400" />
                        <span>من: {contract.start_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Clock size={13} className="text-slate-400" />
                        <span>إلى: {contract.end_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white col-span-2">
                        <DollarSign size={13} className="text-emerald-500" />
                        <span>القيمة: {money(Number(contract.value))}</span>
                        {remaining > 0 ? (
                          <span className="ms-auto text-[10px] text-slate-400 font-normal">
                            متبقي {remaining} يوماً
                          </span>
                        ) : (
                          <span className="ms-auto text-[10px] text-rose-500 font-normal">
                            انتهى تاريخ العقد
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notes (Read-only) */}
                    {contract.notes && (
                      <div className="mt-3 rounded-xl bg-slate-50 dark:bg-white/5 p-3 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white/5">
                        <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                          ملاحظات وتحديثات الإدارة:
                        </span>
                        {contract.notes}
                      </div>
                    )}
                  </div>

                  {/* Read-only verification footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      معتمد ومسجل بسجلات أوبكيا
                    </span>
                    <span className="font-mono text-[10px]">ID: {contract.id.slice(0, 8)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
