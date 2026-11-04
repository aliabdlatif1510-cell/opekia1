"use client";

import { useEffect, useState, useMemo, type FormEvent } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  Receipt,
  Layers,
  Sparkles,
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
  Filter,
  Trash2,
  X,
} from "lucide-react";
import { SEED, TYPE_LABEL, STATUS_LABEL, STATUS_STYLE, type Contract } from "@/lib/contracts";
import {
  SEED_TASKS,
  SEED_INVOICES,
  PRIORITY_LABEL,
  PRIORITY_STYLE,
  TASK_STATUS_LABEL,
  TASK_STATUS_STYLE,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_STYLE,
  type WorkTask,
  type Invoice,
  type TaskPriority,
  type TaskStatus,
  type InvoiceStatus,
} from "@/lib/work-data";

const KEY_CONTRACTS = "opekia_contracts";
const KEY_TASKS = "opekia_tasks";
const KEY_INVOICES = "opekia_invoices";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type ActiveTab = "all" | "contracts" | "tasks" | "invoices";

export default function DashboardClient() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");

  // Work Data State
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Modals state
  const [taskModal, setTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("high");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const [invoiceModal, setInvoiceModal] = useState(false);
  const [newInvClient, setNewInvClient] = useState("");
  const [newInvAmount, setNewInvAmount] = useState<number>(0);
  const [newInvService, setNewInvService] = useState("");
  const [newInvDueDate, setNewInvDueDate] = useState("");
  const [newInvStatus, setNewInvStatus] = useState<InvoiceStatus>("pending");

  const [toast, setToast] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const rawSession = localStorage.getItem("opekia_session");
        if (rawSession) setUser(JSON.parse(rawSession));

        const rawC = localStorage.getItem(KEY_CONTRACTS);
        setContracts(rawC ? JSON.parse(rawC) : SEED);

        const rawT = localStorage.getItem(KEY_TASKS);
        setTasks(rawT ? JSON.parse(rawT) : SEED_TASKS);

        const rawI = localStorage.getItem(KEY_INVOICES);
        setInvoices(rawI ? JSON.parse(rawI) : SEED_INVOICES);
      } catch (e) {
        console.error("Storage load error:", e);
      }
    }
  }, []);

  // Sync tasks to local storage
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        localStorage.setItem(KEY_TASKS, JSON.stringify(tasks));
      } catch {}
    }
  }, [tasks, mounted]);

  // Sync invoices to local storage
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        localStorage.setItem(KEY_INVOICES, JSON.stringify(invoices));
      } catch {}
    }
  }, [invoices, mounted]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // KPIs
  const stats = useMemo(() => {
    const activeContracts = contracts.filter((c) => c.status === "active").length;
    const totalContractValue = contracts.reduce((acc, c) => acc + (c.value || 0), 0);

    const pendingTasks = tasks.filter((t) => t.status !== "done").length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const taskRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const totalInvoices = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
    const paidInvoices = invoices
      .filter((i) => i.status === "paid")
      .reduce((acc, i) => acc + (i.amount || 0), 0);
    const pendingInvoices = invoices
      .filter((i) => i.status !== "paid")
      .reduce((acc, i) => acc + (i.amount || 0), 0);

    return {
      activeContracts,
      totalContractValue,
      pendingTasks,
      completedTasks,
      taskRate,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
    };
  }, [contracts, tasks, invoices]);

  // Task Actions
  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus: TaskStatus =
            t.status === "todo" ? "in_progress" : t.status === "in_progress" ? "done" : "todo";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setToast("🗑️ تم حذف المهمة");
  };

  const handleCreateTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: WorkTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      project: newTaskProject.trim() || "عام",
      priority: newTaskPriority,
      status: "todo",
      dueDate: newTaskDueDate || new Date().toISOString().split("T")[0],
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
    setNewTaskProject("");
    setNewTaskDueDate("");
    setTaskModal(false);
    setToast("✅ تمت إضافة المهمة بنجاح");
  };

  // Invoice Actions
  const toggleInvoiceStatus = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const nextStatus: InvoiceStatus =
            inv.status === "pending" ? "paid" : inv.status === "paid" ? "overdue" : "pending";
          return { ...inv, status: nextStatus };
        }
        return inv;
      })
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    setToast("🗑️ تم حذف الفاتورة");
  };

  const handleCreateInvoice = (e: FormEvent) => {
    e.preventDefault();
    if (!newInvClient.trim() || !newInvAmount) return;
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      number: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      client: newInvClient.trim(),
      amount: Number(newInvAmount),
      service: newInvService.trim() || "خدمات أعمال",
      dueDate: newInvDueDate || new Date().toISOString().split("T")[0],
      status: newInvStatus,
    };
    setInvoices((prev) => [newInv, ...prev]);
    setNewInvClient("");
    setNewInvAmount(0);
    setNewInvService("");
    setNewInvDueDate("");
    setInvoiceModal(false);
    setToast("✅ تم تسجيل الفاتورة بنجاح");
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-navy-900 to-emerald-950 p-6 text-white shadow-xl dark:border dark:border-white/10 md:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles size={14} /> لوحة التحكم الذكية
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              أهلاً بك، {user?.name ?? "يا مرحباً"} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-300 md:text-base">
              هنا تجد ملخص عملك اليومي متكاملاً: العقود، المهام والمشاريع، والفواتير والمالية.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setTaskModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              <Plus size={16} /> مهمة جديدة
            </button>
            <button
              onClick={() => setInvoiceModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Receipt size={16} /> إضافة فاتورة
            </button>
            <Link
              href="/dashboard/work"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <Briefcase size={16} /> إدارة العقود
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Main Work KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* KPI 1: Contracts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">1. العقود والشراكات</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">{stats.activeContracts} عقود نشطة</div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>إجمالي القيمة التعاقدية:</span>
              <span className="font-bold text-emerald-500">{money(stats.totalContractValue)}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">2. المهام والمشاريع</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">{stats.pendingTasks} مهام متبقية</div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>نسبة الإنجاز:</span>
              <span className="font-bold text-blue-500">{stats.taskRate}% ({stats.completedTasks} مكتملة)</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Invoices */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">3. العملاء والفواتير</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Receipt size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">{money(stats.totalInvoices)}</div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>المحصل: <span className="font-bold text-emerald-500">{money(stats.paidInvoices)}</span></span>
              <span>المعلق: <span className="font-bold text-amber-500">{money(stats.pendingInvoices)}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 dark:border-white/10">
        {[
          { key: "all", label: "🌟 لوحة العمل الشاملة" },
          { key: "contracts", label: "📄 العقود والشراكات" },
          { key: "tasks", label: "🎯 المهام والمشاريع" },
          { key: "invoices", label: "💳 الفواتير والمالية" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as ActiveTab)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: CONTRACTS & PARTNERSHIPS */}
      {(activeTab === "all" || activeTab === "contracts") && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="text-emerald-500" size={22} />
                1. العقود والشراكات النشطة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                متابعة الاتفاقيات الاستراتيجية وعقود التوريد والخدمات
              </p>
            </div>
            <Link
              href="/dashboard/work"
              className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              عرض الكل وإدارة العقود <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contracts.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-navy-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900 dark:text-white">{c.title}</h3>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{c.partner}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[c.status]}`}>
                    {STATUS_LABEL[c.status]}
                  </span>
                </div>

                <div className="my-3 flex items-center justify-between text-xs">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold dark:bg-white/5">
                    {TYPE_LABEL[c.type]}
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{money(c.value)}</span>
                </div>

                <div className="mt-auto space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
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
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: TASKS & PROJECTS */}
      {(activeTab === "all" || activeTab === "tasks") && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="text-blue-500" size={22} />
                2. المهام والمشاريع (تفاعلية)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اضغط على الدائرة لتبديل حالة المهمة (انتظار ⏳ → جاري 🚀 → مكتملة ✅)
              </p>
            </div>
            <button
              onClick={() => setTaskModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-400"
            >
              <Plus size={15} /> إضافة مهمة
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-navy-800">
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">لا توجد مهام حالياً. أضف مهمتك الأولى!</div>
              ) : (
                tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskStatus(t.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                          t.status === "done"
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : t.status === "in_progress"
                            ? "border-blue-500 bg-blue-500/20 text-blue-500"
                            : "border-slate-300 hover:border-emerald-400 dark:border-white/20"
                        }`}
                        title="انقر لتبديل الحالة"
                      >
                        {t.status === "done" && <CheckCircle2 size={16} />}
                        {t.status === "in_progress" && <Clock size={14} />}
                      </button>

                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            t.status === "done" ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{t.project}</span>
                          <span>•</span>
                          <span>الموعد: {t.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${PRIORITY_STYLE[t.priority]}`}>
                        {PRIORITY_LABEL[t.priority]}
                      </span>
                      <span
                        onClick={() => toggleTaskStatus(t.id)}
                        className={`cursor-pointer rounded-lg px-2 py-0.5 text-xs font-semibold ${TASK_STATUS_STYLE[t.status]}`}
                      >
                        {TASK_STATUS_LABEL[t.status]}
                      </span>
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
                        title="حذف المهمة"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: INVOICES & FINANCE */}
      {(activeTab === "all" || activeTab === "invoices") && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Receipt className="text-amber-500" size={22} />
                3. العملاء والفواتير والمالية
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                متابعة الفواتير الصادرة للعملاء والمستحقات وحالات السداد
              </p>
            </div>
            <button
              onClick={() => setInvoiceModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-400"
            >
              <Plus size={15} /> إضافة فاتورة
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-navy-800">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-start">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-start">العميل / الجهة</th>
                  <th className="px-4 py-3 text-start">الخدمة</th>
                  <th className="px-4 py-3 text-start">المبلغ</th>
                  <th className="px-4 py-3 text-start">تاريخ الاستحقاق</th>
                  <th className="px-4 py-3 text-start">الحالة</th>
                  <th className="px-4 py-3 text-end">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      لا توجد فواتير مسجلة حالياً.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="transition hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono font-bold text-xs">{inv.number}</td>
                      <td className="px-4 py-3 font-bold">{inv.client}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{inv.service}</td>
                      <td className="px-4 py-3 font-black text-emerald-600 dark:text-emerald-400">
                        {money(inv.amount)}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono">{inv.dueDate}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleInvoiceStatus(inv.id)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition hover:opacity-80 ${INVOICE_STATUS_STYLE[inv.status]}`}
                          title="انقر لتغيير حالة السداد"
                        >
                          {INVOICE_STATUS_LABEL[inv.status]}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <button
                          onClick={() => deleteInvoice(inv.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* MODAL: ADD TASK */}
      {taskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTask}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/10">
              <h3 className="text-lg font-bold">🎯 إضافة مهمة جديدة</h3>
              <button
                type="button"
                onClick={() => setTaskModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">عنوان المهمة *</span>
              <input
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="مثال: مراجعة العقد الفني مع الفريق"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-navy-900"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">المشروع / الجهة</span>
                <input
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  placeholder="مثال: تطوير المنصة"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold">الأولوية</span>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-navy-900"
                >
                  <option value="urgent">عاجل جداً</option>
                  <option value="high">أولوية عالية</option>
                  <option value="normal">عادي</option>
                </select>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">تاريخ الاستحقاق</span>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-navy-900"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTaskModal(false)}
                className="rounded-xl px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-bold text-white hover:bg-blue-400"
              >
                إضافة المهمة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD INVOICE */}
      {invoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateInvoice}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/10">
              <h3 className="text-lg font-bold">💳 تسجيل فاتورة / مطالبة جديدة</h3>
              <button
                type="button"
                onClick={() => setInvoiceModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">اسم العميل / الجهة *</span>
                <input
                  required
                  value={newInvClient}
                  onChange={(e) => setNewInvClient(e.target.value)}
                  placeholder="مثال: شركة التقنية الحديثة"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold">المبلغ (USD) *</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={newInvAmount || ""}
                  onChange={(e) => setNewInvAmount(Number(e.target.value))}
                  placeholder="5000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-semibold">بيان الخدمة</span>
              <input
                value={newInvService}
                onChange={(e) => setNewInvService(e.target.value)}
                placeholder="مثال: دفعة تطوير المرحلة الأولى"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:border-white/10 dark:bg-navy-900"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">تاريخ الاستحقاق</span>
                <input
                  type="date"
                  value={newInvDueDate}
                  onChange={(e) => setNewInvDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold">الحالة</span>
                <select
                  value={newInvStatus}
                  onChange={(e) => setNewInvStatus(e.target.value as InvoiceStatus)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:border-white/10 dark:bg-navy-900"
                >
                  <option value="pending">بانتظار السداد</option>
                  <option value="paid">مدفوعة</option>
                  <option value="overdue">متأخرة</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInvoiceModal(false)}
                className="rounded-xl px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-bold text-white hover:bg-amber-400"
              >
                تسجيل الفاتورة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-4 start-4 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl dark:bg-emerald-600">
          {toast}
        </div>
      )}
    </div>
  );
}
