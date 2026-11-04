"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  Handshake,
  FileCheck2,
  TrendingUp,
  Plus,
  Search,
  Trash2,
  X,
  Sparkles,
  ChevronLeft,
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
  SEED_RECOMMENDATIONS,
  PRIORITY_CONFIG,
  STATUS_CONFIG as REC_STATUS_CONFIG,
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

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type ActiveSection = "partnerships" | "contracts" | "opportunities" | "recommendations";

export default function WorkClient() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveSection>("partnerships");
  const [searchQuery, setSearchQuery] = useState("");

  // Listen to URL query params for direct tab & new modal triggers
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
    const isNew = searchParams.get("new");
    if (isNew === "true" || isNew === "1") {
      if (tab === "partnerships") setPartnerModal(true);
      if (tab === "contracts") setContractModal(true);
      if (tab === "opportunities") setOppModal(true);
      if (tab === "recommendations") setRecModal(true);
    }
  }, [searchParams]);

  // 1. الشراكات
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [partnerModal, setPartnerModal] = useState(false);
  const [pName, setPName] = useState("");
  const [pType, setPType] = useState<Partnership["type"]>("strategic");
  const [pField, setPField] = useState("");
  const [pContact, setPContact] = useState("");
  const [pNotes, setPNotes] = useState("");

  // 2. تعاقدات
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [contractModal, setContractModal] = useState(false);
  const [cTitle, setCTitle] = useState("");
  const [cParty, setCParty] = useState("");
  const [cValue, setCValue] = useState<number>(0);
  const [cStart, setCStart] = useState("");
  const [cEnd, setCEnd] = useState("");
  const [cProgress, setCProgress] = useState<number>(50);
  const [cStatus, setCStatus] = useState<ContractItem["status"]>("active");
  const [cNotes, setCNotes] = useState("");

  // 3. فرص
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppModal, setOppModal] = useState(false);
  const [oTitle, setOTitle] = useState("");
  const [oClient, setOClient] = useState("");
  const [oValue, setOValue] = useState<number>(0);
  const [oStage, setOStage] = useState<Opportunity["stage"]>("lead");
  const [oProbability, setOProbability] = useState<number>(50);
  const [oClose, setOClose] = useState("");
  const [oNotes, setONotes] = useState("");

  // 4. التوصيات (مربوطة بصفحة الهوم)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recModal, setRecModal] = useState(false);
  const [rTitle, setRTitle] = useState("");
  const [rCategory, setRCategory] = useState("تطوير واستراتيجية");
  const [rPriority, setRPriority] = useState<Recommendation["priority"]>("high");
  const [rImpact, setRImpact] = useState("");
  const [rDate, setRDate] = useState("");
  const [rDescription, setRDescription] = useState("");
  const [rStatus, setRStatus] = useState<Recommendation["status"]>("active");
  const [recFilter, setRecFilter] = useState<string>("all");
  const [recSearch, setRecSearch] = useState("");

  const [toast, setToast] = useState("");

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

  // Statistics
  const stats = useMemo(() => {
    const totalP = partnerships.length;
    const activeP = partnerships.filter((p) => p.status === "active").length;

    const totalC = contracts.length;
    const totalCValue = contracts.reduce((acc, c) => acc + (c.value || 0), 0);

    const totalO = opportunities.length;
    const totalOValue = opportunities.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);
    const wonOValue = opportunities
      .filter((o) => o.stage === "won")
      .reduce((acc, o) => acc + (o.estimatedValue || 0), 0);

    const totalR = recommendations.length;
    const activeR = recommendations.filter((r) => r.status === "active").length;

    return { totalP, activeP, totalC, totalCValue, totalO, totalOValue, wonOValue, totalR, activeR };
  }, [partnerships, contracts, opportunities, recommendations]);

  // Form Submissions
  const addPartnership = (e: FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;
    const newItem: Partnership = {
      id: `p-${Date.now()}`,
      name: pName.trim(),
      type: pType,
      field: pField.trim() || "تطوير أعمال",
      status: "active",
      contact: pContact.trim() || "غير محدد",
      notes: pNotes.trim(),
    };
    setPartnerships([newItem, ...partnerships]);
    setPName("");
    setPField("");
    setPContact("");
    setPNotes("");
    setPartnerModal(false);
    setToast("✅ تمت إضافة الشراكة بنجاح");
  };

  const addContract = (e: FormEvent) => {
    e.preventDefault();
    if (!cTitle.trim() || !cParty.trim()) return;
    const newItem: ContractItem = {
      id: `c-${Date.now()}`,
      title: cTitle.trim(),
      party: cParty.trim(),
      value: Number(cValue) || 0,
      startDate: cStart || new Date().toISOString().split("T")[0],
      endDate: cEnd || new Date().toISOString().split("T")[0],
      progress: Number(cProgress) || 0,
      status: cStatus,
      notes: cNotes.trim(),
    };
    setContracts([newItem, ...contracts]);
    setCTitle("");
    setCParty("");
    setCValue(0);
    setCStart("");
    setCEnd("");
    setCProgress(50);
    setCNotes("");
    setContractModal(false);
    setToast("✅ تم تسجيل التعاقد بنجاح");
  };

  const addOpportunity = (e: FormEvent) => {
    e.preventDefault();
    if (!oTitle.trim() || !oClient.trim()) return;
    const newItem: Opportunity = {
      id: `op-${Date.now()}`,
      title: oTitle.trim(),
      client: oClient.trim(),
      estimatedValue: Number(oValue) || 0,
      stage: oStage,
      probability: Number(oProbability) || 50,
      expectedClose: oClose || new Date().toISOString().split("T")[0],
      notes: oNotes.trim(),
    };
    setOpportunities([newItem, ...opportunities]);
    setOTitle("");
    setOClient("");
    setOValue(0);
    setOProbability(50);
    setOClose("");
    setONotes("");
    setOppModal(false);
    setToast("✅ تمت إضافة الفرصة الاستثمارية");
  };

  const addRecommendation = (e: FormEvent) => {
    e.preventDefault();
    if (!rTitle.trim()) return;
    const newItem: Recommendation = {
      id: `rec-${Date.now()}`,
      title: rTitle.trim(),
      category: rCategory.trim() || "تطوير واستراتيجية",
      priority: rPriority,
      impact: rImpact.trim() || "تحسين الأداء التشغيلي والمالي",
      date: rDate || new Date().toISOString().split("T")[0],
      description: rDescription.trim() || "توصية تنفيذية صادرة من الإدارة لتعزيز النتائج.",
      status: rStatus,
    };
    setRecommendations([newItem, ...recommendations]);
    setRTitle("");
    setRCategory("تطوير واستراتيجية");
    setRPriority("high");
    setRImpact("");
    setRDate("");
    setRDescription("");
    setRStatus("active");
    setRecModal(false);
    setToast("✅ تمت إضافة التوصية وربطها بالهوم بنجاح");
  };

  // Stage Advancement for Opportunities
  const advanceStage = (id: string) => {
    const sequence: Opportunity["stage"][] = ["lead", "proposal", "negotiation", "won"];
    setOpportunities((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const nextIndex = (sequence.indexOf(o.stage) + 1) % sequence.length;
          return { ...o, stage: sequence[nextIndex] };
        }
        return o;
      })
    );
  };

  // Toggle Recommendation Status
  const toggleRecStatus = (id: string) => {
    const sequence: Recommendation["status"][] = ["active", "planned", "completed"];
    setRecommendations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextIndex = (sequence.indexOf(r.status) + 1) % sequence.length;
          return { ...r, status: sequence[nextIndex] };
        }
        return r;
      })
    );
  };

  // Filter recommendations
  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      const matchSearch =
        !recSearch.trim() ||
        r.title.toLowerCase().includes(recSearch.toLowerCase()) ||
        r.category.toLowerCase().includes(recSearch.toLowerCase()) ||
        r.description.toLowerCase().includes(recSearch.toLowerCase());
      const matchFilter = recFilter === "all" || r.status === recFilter;
      return matchSearch && matchFilter;
    });
  }, [recommendations, recSearch, recFilter]);

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-white/10 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">شغلي</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            إدارة أركان العمل الأربعة: الشراكات، التعاقدات، الفرص، والتوصيات المرتبطة بالصفحة الرئيسية
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 shadow-sm dark:border-white/10 dark:bg-navy-800 dark:text-slate-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>منظومة الأعمال والصفقات والتوصيات النشطة</span>
        </div>
      </div>

      {/* 4 Main Action Boxes (الشراكات، التعاقدات، الفرص، التوصيات) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* المربع 1: الشراكات */}
        <div
          className={`flex flex-col justify-between rounded-3xl border-2 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 ${
            activeTab === "partnerships"
              ? "border-blue-500 bg-gradient-to-b from-blue-500/10 via-blue-500/[0.03] to-transparent ring-4 ring-blue-500/15 dark:bg-navy-800"
              : "border-slate-200 bg-white/90 hover:border-blue-400 dark:border-white/10 dark:bg-navy-800/90"
          }`}
        >
          {/* رأس المربع */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30">
                <Handshake size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">الشراكات</h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {stats.activeP} شراكات نشطة
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("partnerships")}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                activeTab === "partnerships"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
              }`}
            >
              عرض الجدول
            </button>
          </div>

          {/* قلب المربع: شراكة جديدة */}
          <div className="my-6 flex flex-col items-center justify-center text-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab("partnerships");
                setPartnerModal(true);
              }}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-4 text-sm font-black text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-blue-500/50 active:scale-[0.98]"
            >
              <Plus size={18} className="transition-transform group-hover:rotate-90" />
              <span>شراكة جديدة</span>
            </button>
            <span className="mt-2 text-[11px] font-bold text-slate-400">
              إجمالي الشراكات: {stats.totalP}
            </span>
          </div>
        </div>

        {/* المربع 2: التعاقدات */}
        <div
          className={`flex flex-col justify-between rounded-3xl border-2 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 ${
            activeTab === "contracts"
              ? "border-emerald-500 bg-gradient-to-b from-emerald-500/10 via-emerald-500/[0.03] to-transparent ring-4 ring-emerald-500/15 dark:bg-navy-800"
              : "border-slate-200 bg-white/90 hover:border-emerald-400 dark:border-white/10 dark:bg-navy-800/90"
          }`}
        >
          {/* رأس المربع */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30">
                <FileCheck2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">التعاقدات</h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {stats.totalC} عقود سارية
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("contracts")}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                activeTab === "contracts"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
              }`}
            >
              عرض الجدول
            </button>
          </div>

          {/* قلب المربع: تعاقد جديد */}
          <div className="my-6 flex flex-col items-center justify-center text-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab("contracts");
                setContractModal(true);
              }}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 px-4 text-sm font-black text-white shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-emerald-500/50 active:scale-[0.98]"
            >
              <Plus size={18} className="transition-transform group-hover:rotate-90" />
              <span>تعاقد جديد</span>
            </button>
            <span className="mt-2 text-[11px] font-bold text-slate-400">
              إجمالي القيمة: {money(stats.totalCValue)}
            </span>
          </div>
        </div>

        {/* المربع 3: الفرص */}
        <div
          className={`flex flex-col justify-between rounded-3xl border-2 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 ${
            activeTab === "opportunities"
              ? "border-amber-500 bg-gradient-to-b from-amber-500/10 via-amber-500/[0.03] to-transparent ring-4 ring-amber-500/15 dark:bg-navy-800"
              : "border-slate-200 bg-white/90 hover:border-amber-400 dark:border-white/10 dark:bg-navy-800/90"
          }`}
        >
          {/* رأس المربع */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30">
                <TrendingUp size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">الفرص</h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {stats.totalO} صفقات ومسارات
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                activeTab === "opportunities"
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
              }`}
            >
              عرض الجدول
            </button>
          </div>

          {/* قلب المربع: فرص جديد */}
          <div className="my-6 flex flex-col items-center justify-center text-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab("opportunities");
                setOppModal(true);
              }}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 px-4 text-sm font-black text-white shadow-xl shadow-amber-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-amber-500/50 active:scale-[0.98]"
            >
              <Plus size={18} className="transition-transform group-hover:rotate-90" />
              <span>فرصة جديدة</span>
            </button>
            <span className="mt-2 text-[11px] font-bold text-slate-400">
              القيمة المتوقعة: {money(stats.totalOValue)}
            </span>
          </div>
        </div>

        {/* المربع 4: التوصيات (مربوطة بصفحة الهوم) */}
        <div
          className={`flex flex-col justify-between rounded-3xl border-2 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 ${
            activeTab === "recommendations"
              ? "border-purple-500 bg-gradient-to-b from-purple-500/10 via-purple-500/[0.03] to-transparent ring-4 ring-purple-500/15 dark:bg-navy-800"
              : "border-slate-200 bg-white/90 hover:border-purple-400 dark:border-white/10 dark:bg-navy-800/90"
          }`}
        >
          {/* رأس المربع */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/30">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">التوصيات</h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {stats.activeR} توصيات نشطة
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                activeTab === "recommendations"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
              }`}
            >
              عرض الجدول
            </button>
          </div>

          {/* قلب المربع: توصية جديدة */}
          <div className="my-6 flex flex-col items-center justify-center text-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab("recommendations");
                setRecModal(true);
              }}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 px-4 text-sm font-black text-white shadow-xl shadow-purple-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-purple-500/50 active:scale-[0.98]"
            >
              <Plus size={18} className="transition-transform group-hover:rotate-90" />
              <span>توصية جديدة</span>
            </button>
            <span className="mt-2 text-[11px] font-bold text-slate-400">
              مربوطة بصفحة الهوم: {stats.totalR} توصية
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Switcher */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-navy-900/60">
        <button
          onClick={() => setActiveTab("partnerships")}
          className={`flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-bold transition-all ${
            activeTab === "partnerships"
              ? "bg-white text-blue-600 shadow-md dark:bg-navy-800 dark:text-blue-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          🤝 الشراكات ({partnerships.length})
        </button>

        <button
          onClick={() => setActiveTab("contracts")}
          className={`flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-bold transition-all ${
            activeTab === "contracts"
              ? "bg-white text-emerald-600 shadow-md dark:bg-navy-800 dark:text-emerald-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          📄 تعاقدات ({contracts.length})
        </button>

        <button
          onClick={() => setActiveTab("opportunities")}
          className={`flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-bold transition-all ${
            activeTab === "opportunities"
              ? "bg-white text-amber-600 shadow-md dark:bg-navy-800 dark:text-amber-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          🚀 فرص ({opportunities.length})
        </button>

        <button
          onClick={() => setActiveTab("recommendations")}
          className={`flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-bold transition-all ${
            activeTab === "recommendations"
              ? "bg-white text-purple-600 shadow-md dark:bg-navy-800 dark:text-purple-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          ✨ التوصيات ({recommendations.length})
        </button>
      </div>

      {/* SECTION 1: الشراكات (Partnerships) */}
      {activeTab === "partnerships" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Handshake className="text-blue-600" size={22} /> الشراكات الاستراتيجية والتعاون
            </h2>
            <button
              onClick={() => setPartnerModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
            >
              <Plus size={16} /> إضافة شريك
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {partnerships.map((p) => {
              const statusCfg = PARTNERSHIP_STATUS[p.status] || PARTNERSHIP_STATUS.active;
              return (
                <div
                  key={p.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-navy-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900 dark:text-white">{p.name}</h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{p.field}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusCfg.style}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="my-3 space-y-1.5 border-y border-slate-100 py-3 text-xs dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">نوع الشراكة:</span>
                      <span className="font-semibold">{PARTNERSHIP_TYPES[p.type] || p.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">جهة التواصل:</span>
                      <span className="font-semibold">{p.contact}</span>
                    </div>
                  </div>

                  {p.notes && (
                    <p className="text-xs text-slate-600 line-clamp-2 dark:text-slate-300">
                      📝 {p.notes}
                    </p>
                  )}

                  <div className="mt-auto flex justify-end pt-4">
                    <button
                      onClick={() => {
                        setPartnerships(partnerships.filter((item) => item.id !== p.id));
                        setToast("🗑️ تم حذف الشراكة");
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: تعاقدات (Contracts) */}
      {activeTab === "contracts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileCheck2 className="text-emerald-600" size={22} /> التعاقدات والاتفاقيات الملزمة
            </h2>
            <button
              onClick={() => setContractModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
            >
              <Plus size={16} /> تسجيل تعاقد
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contracts.map((c) => {
              const statusCfg = CONTRACT_STATUS[c.status] || CONTRACT_STATUS.active;
              return (
                <div
                  key={c.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-navy-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900 dark:text-white">{c.title}</h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">الطرف الآخر: {c.party}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusCfg.style}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="my-3 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-white/5">
                    <span className="text-xs text-slate-500">القيمة المالية</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {money(c.value)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>الفترة:</span>
                      <span className="font-mono">{c.startDate} ← {c.endDate}</span>
                    </div>

                    <div className="pt-1">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>نسبة الإنجاز</span>
                        <span className="font-bold">{c.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {c.notes && (
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 dark:text-slate-300">
                      📝 {c.notes}
                    </p>
                  )}

                  <div className="mt-auto flex justify-end pt-4">
                    <button
                      onClick={() => {
                        setContracts(contracts.filter((item) => item.id !== c.id));
                        setToast("🗑️ تم حذف العقد");
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: فرص (Opportunities) */}
      {activeTab === "opportunities" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="text-amber-600" size={22} /> مسار الفرص والصفقات (Pipeline)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                انقر على حالة الصفقة لنقلها للمرحلة التالية في مسار الأعمال
              </p>
            </div>
            <button
              onClick={() => setOppModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-500"
            >
              <Plus size={16} /> إضافة فرصة
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((op) => {
              const stageCfg = STAGE_CONFIG[op.stage] || STAGE_CONFIG.lead;
              return (
                <div
                  key={op.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-navy-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900 dark:text-white">{op.title}</h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">العميل المستهدف: {op.client}</p>
                    </div>
                    <button
                      onClick={() => advanceStage(op.id)}
                      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-bold transition hover:opacity-80 ${stageCfg.style}`}
                      title="انقر لنقل الصفقة للمرحلة التالية"
                    >
                      {stageCfg.label}
                    </button>
                  </div>

                  <div className="my-3 flex items-center justify-between rounded-xl bg-amber-50/50 p-2.5 dark:bg-amber-950/20">
                    <span className="text-xs text-slate-500">القيمة المتوقعة</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">
                      {money(op.estimatedValue)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>احتمالية النجاح:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{op.probability}%</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>الإغلاق المتوقع:</span>
                      <span className="font-mono">{op.expectedClose}</span>
                    </div>
                  </div>

                  {op.notes && (
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 dark:text-slate-300">
                      💬 {op.notes}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <button
                      onClick={() => advanceStage(op.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline dark:text-amber-400"
                    >
                      تقدم المرحلة <ChevronLeft size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setOpportunities(opportunities.filter((item) => item.id !== op.id));
                        setToast("🗑️ تم حذف الفرصة");
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: التوصيات (Recommendations - مربوطة بصفحة الهوم) */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-purple-600" size={22} /> التوصيات الإدارية والاستراتيجية
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                توصيات حية ترتبط مباشرة بخانة التوصيات في الصفحة الرئيسية لبوابة العميل وتنعكس فورياً
              </p>
            </div>
            <button
              onClick={() => setRecModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/25 transition hover:brightness-110"
            >
              <Plus size={16} /> إضافة توصية
            </button>
          </div>

          {/* Filter Chips & Search Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3 backdrop-blur dark:border-white/10 dark:bg-navy-800/70 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "الكل" },
                { id: "active", label: "نشطة وجارية" },
                { id: "planned", label: "مخططة" },
                { id: "completed", label: "تم التطبيق" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setRecFilter(f.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    recFilter === f.id
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={recSearch}
                onChange={(e) => setRecSearch(e.target.value)}
                placeholder="بحث في التوصيات..."
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pe-3 ps-9 text-xs outline-none focus:border-purple-500 dark:border-white/10 dark:bg-navy-900"
              />
            </div>
          </div>

          {/* Recommendations Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecs.map((r) => {
              const priorityCfg = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.normal;
              const statusCfg = REC_STATUS_CONFIG[r.status] || REC_STATUS_CONFIG.active;
              return (
                <div
                  key={r.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-navy-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="inline-block rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                        {r.category}
                      </span>
                      <h3 className="mt-1 font-bold text-slate-900 dark:text-white line-clamp-2">{r.title}</h3>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${priorityCfg.style}`}>
                      {priorityCfg.label}
                    </span>
                  </div>

                  <p className="my-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                    {r.description}
                  </p>

                  {r.impact && (
                    <div className="mb-3 rounded-xl bg-purple-50/60 p-2.5 text-xs dark:bg-purple-950/20">
                      <span className="font-bold text-purple-700 dark:text-purple-300">الأثر المستهدف: </span>
                      <span className="text-slate-600 dark:text-slate-300">{r.impact}</span>
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-white/5">
                    <button
                      onClick={() => toggleRecStatus(r.id)}
                      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-bold transition hover:opacity-80 ${statusCfg.style}`}
                      title="انقر لتغيير حالة التوصية"
                    >
                      {statusCfg.label}
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">{r.date}</span>
                      <button
                        onClick={() => {
                          setRecommendations(recommendations.filter((item) => item.id !== r.id));
                          setToast("🗑️ تم حذف التوصية");
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD PARTNERSHIP */}
      {partnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={addPartnership}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/10">
              <h3 className="text-lg font-bold">🤝 إضافة شراكة جديدة</h3>
              <button
                type="button"
                onClick={() => setPartnerModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">اسم الشريك / المؤسسة *</span>
              <input
                required
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="مثال: شركة الحلول المتقدمة"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">مجال الشراكة</span>
                <input
                  value={pField}
                  onChange={(e) => setPField(e.target.value)}
                  placeholder="مثال: الخدمات السحابية"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold">نوع الشراكة</span>
                <select
                  value={pType}
                  onChange={(e) => setPType(e.target.value as Partnership["type"])}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
                >
                  <option value="strategic">شراكة استراتيجية</option>
                  <option value="tech">شراكة تقنية وتطوير</option>
                  <option value="marketing">شراكة تسويق وتوزيع</option>
                  <option value="mou">مذكرة تفاهم</option>
                </select>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">مسؤول التواصل</span>
              <input
                value={pContact}
                onChange={(e) => setPContact(e.target.value)}
                placeholder="مثال: م. أحمد عبد الله"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">ملاحظات إضافية</span>
              <textarea
                rows={2}
                value={pNotes}
                onChange={(e) => setPNotes(e.target.value)}
                placeholder="أهداف ومخرجات الشراكة..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPartnerModal(false)}
                className="rounded-xl px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-500"
              >
                حفظ الشراكة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD CONTRACT */}
      {contractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={addContract}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/10">
              <h3 className="text-lg font-bold">📄 تسجيل تعاقد جديد</h3>
              <button
                type="button"
                onClick={() => setContractModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">موضوع أو عنوان العقد *</span>
              <input
                required
                value={cTitle}
                onChange={(e) => setCTitle(e.target.value)}
                placeholder="مثال: عقد تقديم استشارات تقنية"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-navy-900"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">الطرف الآخر (الجهة) *</span>
                <input
                  required
                  value={cParty}
                  onChange={(e) => setCParty(e.target.value)}
                  placeholder="مثال: شركة التطوير"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold">القيمة المالية (USD)</span>
                <input
                  type="number"
                  min="0"
                  value={cValue || ""}
                  onChange={(e) => setCValue(Number(e.target.value))}
                  placeholder="50000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">تاريخ البداية</span>
                <input
                  type="date"
                  value={cStart}
                  onChange={(e) => setCStart(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold">تاريخ الانتهاء</span>
                <input
                  type="date"
                  value={cEnd}
                  onChange={(e) => setCEnd(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">نسبة الإنجاز ({cProgress}%)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cProgress}
                  onChange={(e) => setCProgress(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold">حالة التعاقد</span>
                <select
                  value={cStatus}
                  onChange={(e) => setCStatus(e.target.value as ContractItem["status"])}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-navy-900"
                >
                  <option value="active">ساري</option>
                  <option value="review">قيد المراجعة</option>
                  <option value="expired">منتهي</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setContractModal(false)}
                className="rounded-xl px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-500"
              >
                تسجيل العقد
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: ADD OPPORTUNITY */}
      {oppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={addOpportunity}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/10">
              <h3 className="text-lg font-bold">🚀 إضافة فرصة تجارية / صفقة</h3>
              <button
                type="button"
                onClick={() => setOppModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">اسم المشروع أو الصفقة *</span>
              <input
                required
                value={oTitle}
                onChange={(e) => setOTitle(e.target.value)}
                placeholder="مثال: تطوير نظام المدفوعات"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:border-white/10 dark:bg-navy-900"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">العميل المستهدف *</span>
                <input
                  required
                  value={oClient}
                  onChange={(e) => setOClient(e.target.value)}
                  placeholder="مثال: مجموعة البركة"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold">القيمة التقديرية (USD)</span>
                <input
                  type="number"
                  min="0"
                  value={oValue || ""}
                  onChange={(e) => setOValue(Number(e.target.value))}
                  placeholder="40000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">المرحلة الحالية</span>
                <select
                  value={oStage}
                  onChange={(e) => setOStage(e.target.value as Opportunity["stage"])}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:border-white/10 dark:bg-navy-900"
                >
                  <option value="lead">استكشاف أولي</option>
                  <option value="proposal">تقديم العرض</option>
                  <option value="negotiation">مرحلة التفاوض</option>
                  <option value="won">تم كسب الصفقة 🎉</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold">احتمالية الفوز ({oProbability}%)</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={oProbability}
                  onChange={(e) => setOProbability(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">تاريخ الإغلاق المتوقع</span>
              <input
                type="date"
                value={oClose}
                onChange={(e) => setOClose(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:border-white/10 dark:bg-navy-900"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOppModal(false)}
                className="rounded-xl px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-bold text-white hover:bg-amber-500"
              >
                تسجيل الفرصة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: ADD RECOMMENDATION (مربوطة بصفحة الهوم) */}
      {recModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={addRecommendation}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="text-purple-600" size={18} /> إضافة توصية استراتيجية (للهوم)
              </h3>
              <button
                type="button"
                onClick={() => setRecModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">عنوان التوصية *</span>
              <input
                required
                value={rTitle}
                onChange={(e) => setRTitle(e.target.value)}
                placeholder="مثال: ترقية بنية السحابة وتأمين المعاملات"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">تصنيف التوصية</span>
                <input
                  value={rCategory}
                  onChange={(e) => setRCategory(e.target.value)}
                  placeholder="مثال: تطوير واستراتيجية"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold">درجة الأولوية</span>
                <select
                  value={rPriority}
                  onChange={(e) => setRPriority(e.target.value as Recommendation["priority"])}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
                >
                  <option value="high">أولوية قصوى</option>
                  <option value="medium">أولوية متوسطة</option>
                  <option value="normal">عادي</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">الأثر المتوقع (المالي / التشغيلي)</span>
                <input
                  value={rImpact}
                  onChange={(e) => setRImpact(e.target.value)}
                  placeholder="مثال: زيادة العائد بنسبة ٢٠٪"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold">تاريخ الاستحقاق أو الإنجاز</span>
                <input
                  type="date"
                  value={rDate}
                  onChange={(e) => setRDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">حالة التوصية</span>
              <select
                value={rStatus}
                onChange={(e) => setRStatus(e.target.value as Recommendation["status"])}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
              >
                <option value="active">نشطة وجارية</option>
                <option value="planned">مخططة للمرحلة القادمة</option>
                <option value="completed">تم التطبيق</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">التفاصيل وشرح التوصية</span>
              <textarea
                rows={3}
                value={rDescription}
                onChange={(e) => setRDescription(e.target.value)}
                placeholder="شرح الإجراءات والخطوات التنفيذية للتوصية..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-navy-900"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecModal(false)}
                className="rounded-xl px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 text-sm font-bold text-white hover:brightness-110"
              >
                حفظ التوصية ونشرها للهوم
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 start-4 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl dark:bg-emerald-600">
          {toast}
        </div>
      )}
    </div>
  );
}
