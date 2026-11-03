export type ContractType = "strategic" | "service" | "mou";
export type Status = "active" | "review" | "expiring" | "expired";

export interface Contract {
  id: string;
  title: string;
  partner: string;
  type: ContractType;
  start: string;
  end: string;
  value: number;
  progress: number;
  status: Status;
  notes: string;
}

export const TYPE_LABEL: Record<ContractType, string> = {
  strategic: "شراكة استراتيجية",
  service: "عقد توريد أو خدمات",
  mou: "مذكرة تفاهم",
};

export const STATUS_LABEL: Record<Status, string> = {
  active: "نشط",
  review: "قيد المراجعة",
  expiring: "قارب على الانتهاء",
  expired: "منتهي",
};

export const STATUS_STYLE: Record<Status, string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  review: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  expiring: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  expired: "bg-slate-500/15 text-slate-500 dark:text-slate-400",
};

export const daysLeft = (end: string) =>
  Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);

export const SEED: Contract[] = [
  { id: "1", title: "شراكة تطوير منصة الدفع الرقمي", partner: "شركة النيل للتكنولوجيا", type: "strategic", start: "2026-01-10", end: "2027-06-30", value: 480000, progress: 62, status: "active", notes: "اجتماع مراجعة الربع القادم مع الفريق الفني، والموافقة على المرحلة الثالثة." },
  { id: "2", title: "عقد توريد أجهزة الشبكات", partner: "مجموعة الهرم للحلول", type: "service", start: "2025-12-01", end: "2026-11-20", value: 135000, progress: 85, status: "review", notes: "بانتظار مراجعة الضمانات الفنية قبل التوقيع على الملحق الثاني." },
  { id: "3", title: "مذكرة تفاهم للتدريب المهني", partner: "أكاديمية المستقبل", type: "mou", start: "2026-03-01", end: "2026-12-15", value: 60000, progress: 40, status: "active", notes: "تحديد عدد المتدربين وجدول الدورات الأولى." },
  { id: "4", title: "عقد صيانة مراكز البيانات", partner: "الشركة العربية للخدمات", type: "service", start: "2025-06-01", end: "2026-09-30", value: 210000, progress: 100, status: "expired", notes: "تم إغلاق العقد، ومطلوب تقييم الأداء النهائي وأرشفة المستندات." },
  { id: "5", title: "شراكة التسويق الإقليمي", partner: "وكالة أفق الإبداع", type: "strategic", start: "2026-02-15", end: "2027-02-14", value: 275000, progress: 35, status: "active", notes: "إعداد خطة الحملات للربع الأول من 2027." },
];
