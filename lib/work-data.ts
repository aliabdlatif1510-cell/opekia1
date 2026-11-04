export type TaskPriority = "urgent" | "high" | "normal";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface WorkTask {
  id: string;
  title: string;
  project: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}

export type InvoiceStatus = "paid" | "pending" | "overdue";

export interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  service: string;
}

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: "عاجل جداً",
  high: "أولوية عالية",
  normal: "عادي",
};

export const PRIORITY_STYLE: Record<TaskPriority, string> = {
  urgent: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20",
  high: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  normal: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "قيد الانتظار",
  in_progress: "جاري العمل",
  done: "مكتملة",
};

export const TASK_STATUS_STYLE: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300",
  in_progress: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  done: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid: "مدفوعة",
  pending: "بانتظار السداد",
  overdue: "متأخرة",
};

export const INVOICE_STATUS_STYLE: Record<InvoiceStatus, string> = {
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  overdue: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

export const SEED_TASKS: WorkTask[] = [
  {
    id: "t1",
    title: "مراجعة بنود الملحق المالي لمشروع المنصة",
    project: "منصة الدفع الرقمي",
    priority: "urgent",
    status: "in_progress",
    dueDate: "2026-11-06",
  },
  {
    id: "t2",
    title: "إرسال تقرير إنجاز المرحلة الثانية للعميل",
    project: "شبكات الهرم",
    priority: "high",
    status: "todo",
    dueDate: "2026-11-08",
  },
  {
    id: "t3",
    title: "تحديد قائمة المدربين المعتمدين والمواعيد",
    project: "أكاديمية المستقبل",
    priority: "normal",
    status: "done",
    dueDate: "2026-11-01",
  },
  {
    id: "t4",
    title: "تجهيز خطة حملات التسويق الربع سنوية",
    project: "وكالة أفق الإبداع",
    priority: "high",
    status: "in_progress",
    dueDate: "2026-11-12",
  },
];

export const SEED_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    number: "INV-2026-041",
    client: "شركة النيل للتكنولوجيا",
    amount: 120000,
    dueDate: "2026-11-15",
    status: "pending",
    service: "دفعة المرحلة الثانية - تطوير البرمجيات",
  },
  {
    id: "inv-2",
    number: "INV-2026-039",
    client: "مجموعة الهرم للحلول",
    amount: 45000,
    dueDate: "2026-10-30",
    status: "paid",
    service: "توريد أجهزة المراقبة والشبكات",
  },
  {
    id: "inv-3",
    number: "INV-2026-038",
    client: "الشركة العربية للخدمات",
    amount: 70000,
    dueDate: "2026-10-15",
    status: "overdue",
    service: "عقد صيانة الخوادم الربع الثالث",
  },
  {
    id: "inv-4",
    number: "INV-2026-042",
    client: "أكاديمية المستقبل",
    amount: 25000,
    dueDate: "2026-11-25",
    status: "pending",
    service: "رسوم البرامج التدريبية المعتمدة",
  },
];
