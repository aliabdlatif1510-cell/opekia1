"use client";

import { useEffect, useMemo, useState, useCallback, Suspense, type FormEvent } from "react";
import { Plus, Search, Pencil, Trash2, X, Briefcase, FileCheck, AlarmClock, Wallet } from "lucide-react";
import {
  SEED,
  TYPE_LABEL,
  STATUS_LABEL,
  STATUS_STYLE,
  daysLeft,
  type Contract,
  type ContractType,
  type Status,
} from "@/lib/contracts";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const KEY = "opekia_contracts";
type Draft = Omit<Contract, "id">;
const EMPTY: Draft = {
  title: "", partner: "", type: "service", start: "", end: "",
  value: 0, progress: 0, status: "active", notes: "",
};
const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-navy-900";

/** Map a Supabase row to our Contract type */
function rowToContract(row: Record<string, unknown>): Contract {
  return {
    id: row.id as string,
    title: row.title as string,
    partner: row.partner as string,
    type: row.type as ContractType,
    start: row.start_date as string,
    end: row.end_date as string,
    value: Number(row.value),
    progress: Number(row.progress),
    status: row.status as Status,
    notes: (row.notes as string) ?? "",
  };
}

/** Map our Contract/Draft to Supabase columns */
function contractToRow(c: Draft) {
  return {
    title: c.title,
    partner: c.partner,
    type: c.type,
    start_date: c.start,
    end_date: c.end,
    value: c.value,
    progress: c.progress,
    status: c.status,
    notes: c.notes || null,
  };
}

function WorkContent() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<Contract[]>([]);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState("");
  const [ft, setFt] = useState<ContractType | "all">("all");
  const [fs, setFs] = useState<Status | "all">("all");
  const [modal, setModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // ---------- Load data ----------
  const loadData = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("contracts")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          setItems(data.map(rowToContract));
        } else {
          console.warn("Supabase load error, using seed data:", error?.message);
          setItems(SEED);
        }
      } catch {
        setItems(SEED);
      }
    } else {
      // localStorage preview mode
      let data = SEED;
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(KEY);
          if (raw) data = JSON.parse(raw);
        } catch {}
      }
      setItems(data);
    }
    setReady(true);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Save to localStorage in preview mode
  useEffect(() => {
    if (ready && !isSupabaseConfigured && typeof window !== "undefined") {
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {}
    }
  }, [items, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const kpi = useMemo(
    () => ({
      active: items.filter((c) => c.status === "active").length,
      inProgress: items.filter((c) => c.progress > 0 && c.progress < 100 && c.status !== "expired").length,
      expiring: items.filter((c) => {
        const d = daysLeft(c.end);
        return c.status !== "expired" && d >= 0 && d <= 60;
      }).length,
      total: items.reduce((s, c) => s + c.value, 0),
    }),
    [items]
  );

  const filtered = useMemo(
    () =>
      items.filter(
        (c) =>
          (ft === "all" || c.type === ft) &&
          (fs === "all" || c.status === fs) &&
          `${c.title} ${c.partner}`.toLowerCase().includes(q.trim().toLowerCase())
      ),
    [items, q, ft, fs]
  );

  const openNew = () => {
    setForm(EMPTY);
    setModal({ open: true });
  };

  const openEdit = (c: Contract) => {
    const { id, ...rest } = c;
    setForm(rest);
    setModal({ open: true, id });
  };

  // ---------- Save (create / update) ----------
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.partner.trim() || !form.start || !form.end) {
      setToast("⚠️ يرجى تعبئة الحقول الإلزامية");
      return;
    }
    if (form.end < form.start) {
      setToast("⚠️ تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية");
      return;
    }
    setSaving(true);

    if (isSupabaseConfigured) {
      try {
        if (modal.id) {
          // Update
          const { error } = await supabase
            .from("contracts")
            .update({ ...contractToRow(form), updated_at: new Date().toISOString() })
            .eq("id", modal.id);
          if (error) { setToast("❌ " + error.message); setSaving(false); return; }
          setToast("✅ تم تحديث العقد بنجاح");
        } else {
          // Insert
          const { error } = await supabase
            .from("contracts")
            .insert(contractToRow(form));
          if (error) { setToast("❌ " + error.message); setSaving(false); return; }
          setToast("✅ تمت إضافة العقد بنجاح");
        }
        await loadData(); // refresh list from DB
      } catch {
        setToast("❌ خطأ في الاتصال بقاعدة البيانات");
      }
      setSaving(false);
      setModal({ open: false });
      return;
    }

    // localStorage fallback
    setTimeout(() => {
      if (modal.id) {
        const id = modal.id;
        setItems((p) => p.map((c) => (c.id === id ? { ...form, id } : c)));
        setToast("✅ تم تحديث العقد بنجاح");
      } else {
        setItems((p) => [{ ...form, id: `${Date.now()}` }, ...p]);
        setToast("✅ تمت إضافة العقد بنجاح");
      }
      setSaving(false);
      setModal({ open: false });
    }, 400);
  };

  // ---------- Delete ----------
  const remove = async (c: Contract) => {
    if (!confirm(`حذف "${c.title}"؟`)) return;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("contracts").delete().eq("id", c.id);
        if (error) { setToast("❌ " + error.message); return; }
        await loadData();
        setToast("🗑️ تم حذف العقد");
      } catch {
        setToast("❌ خطأ أثناء الحذف");
      }
      return;
    }

    setItems((p) => p.filter((x) => x.id !== c.id));
    setToast("🗑️ تم حذف العقد");
  };

  // ---------- Update status ----------
  const setStatus = async (id: string, status: Status) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("contracts")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) { setToast("❌ " + error.message); return; }
        await loadData();
      } catch {}
      return;
    }
    setItems((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const kpis = [
    { label: "الشراكات النشطة", value: kpi.active, icon: Briefcase, color: "text-emerald-500" },
    { label: "قيد التنفيذ", value: kpi.inProgress, icon: FileCheck, color: "text-blue-500" },
    { label: "تنبيهات التجديد (60 يوماً)", value: kpi.expiring, icon: AlarmClock, color: "text-rose-500" },
    { label: "إجمالي القيمة التعاقدية", value: money(kpi.total), icon: Wallet, color: "text-amber-500" },
  ];

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">شغلي</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">إدارة الشراكات والتعاقدات ومتابعة العقود</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400"
        >
          <Plus size={18} /> عقد / شراكة جديدة
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-navy-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
              <Icon className={color} size={20} />
            </div>
            <div className="mt-3 text-2xl font-extrabold">{value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-navy-800 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم العقد أو الشريك..."
            className={`${inputCls} pe-10`}
          />
        </div>
        <select value={ft} onChange={(e) => setFt(e.target.value as ContractType | "all")} className={`${inputCls} md:w-56`}>
          <option value="all">كل الأنواع</option>
          {(Object.keys(TYPE_LABEL) as ContractType[]).map((k) => (
            <option key={k} value={k}>{TYPE_LABEL[k]}</option>
          ))}
        </select>
        <select value={fs} onChange={(e) => setFs(e.target.value as Status | "all")} className={`${inputCls} md:w-52`}>
          <option value="all">كل الحالات</option>
          {(Object.keys(STATUS_LABEL) as Status[]).map((k) => (
            <option key={k} value={k}>{STATUS_LABEL[k]}</option>
          ))}
        </select>
      </div>

      {!ready ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-white/10">
          لا توجد نتائج مطابقة للبحث أو الفلترة.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const d = daysLeft(c.end);
            return (
              <article key={c.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-navy-800">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold">{c.title}</h3>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">{c.partner}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[c.status]}`}>
                    {STATUS_LABEL[c.status]}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-white/5">{TYPE_LABEL[c.type]}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-white/5">{money(c.value)}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-white/5">
                    {c.start} ← {c.end}
                  </span>
                </div>

                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>نسبة الإنجاز</span>
                  <span className="font-bold">{c.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all" style={{ width: `${c.progress}%` }} />
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {d < 0 ? "انتهى منذ " + Math.abs(d) + " يوم" : d <= 60 ? `ينتهي خلال ${d} يوم ⚠️` : `متبقي ${d} يوم`}
                </p>
                {c.notes && <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">📝 {c.notes}</p>}

                <div className="mt-auto flex items-center gap-2 pt-4">
                  <select
                    value={c.status}
                    onChange={(e) => setStatus(c.id, e.target.value as Status)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-white/10 dark:bg-navy-900"
                  >
                    {(Object.keys(STATUS_LABEL) as Status[]).map((k) => (
                      <option key={k} value={k}>{STATUS_LABEL[k]}</option>
                    ))}
                  </select>
                  <button onClick={() => openEdit(c)} aria-label="تعديل" className="rounded-lg p-2 text-blue-500 hover:bg-blue-500/10">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => remove(c)} aria-label="حذف" className="rounded-lg p-2 text-rose-500 hover:bg-rose-500/10">
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">{modal.id ? "تعديل العقد" : "إضافة عقد / شراكة"}</h2>
              <button type="button" onClick={() => setModal({ open: false })} aria-label="إغلاق" className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold">عنوان العقد / الشراكة *</span>
                <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold">اسم الجهة / الشريك *</span>
                <input className={inputCls} value={form.partner} onChange={(e) => setForm({ ...form, partner: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold">نوع التعاقد</span>
                <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ContractType })}>
                  {(Object.keys(TYPE_LABEL) as ContractType[]).map((k) => (
                    <option key={k} value={k}>{TYPE_LABEL[k]}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold">تاريخ البداية *</span>
                <input type="date" className={inputCls} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold">تاريخ الانتهاء *</span>
                <input type="date" className={inputCls} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold">القيمة المالية (USD)</span>
                <input type="number" min={0} className={inputCls} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) || 0 })} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold">الحالة</span>
                <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
                  {(Object.keys(STATUS_LABEL) as Status[]).map((k) => (
                    <option key={k} value={k}>{STATUS_LABEL[k]}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="flex justify-between text-xs font-semibold">
                  <span>نسبة الإنجاز</span>
                  <span className="text-emerald-500">{form.progress}%</span>
                </span>
                <input type="range" min={0} max={100} className="w-full accent-emerald-500" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold">ملاحظات المتابعة</span>
                <textarea rows={3} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal({ open: false })} className="rounded-xl px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10">
                إلغاء
              </button>
              <button type="submit" disabled={saving} className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-400 disabled:opacity-60">
                {saving ? "جارٍ الحفظ..." : "حفظ"}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 start-4 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl dark:bg-emerald-600">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function WorkClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <WorkContent />
    </Suspense>
  );
}
