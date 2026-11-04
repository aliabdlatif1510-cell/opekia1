export interface Recommendation {
  id: string;
  title: string;
  category: string;
  priority: "high" | "medium" | "normal";
  impact: string;
  date: string;
  description: string;
  status: "active" | "planned" | "completed";
}

export const PRIORITY_CONFIG: Record<string, { label: string; style: string }> = {
  high: { label: "أولوية قصوى", style: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  medium: { label: "أولوية متوسطة", style: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  normal: { label: "عادي", style: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20" },
};

export const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  active: { label: "نشطة وجارية", style: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  planned: { label: "مخططة للمرحلة القادمة", style: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  completed: { label: "تم التطبيق", style: "bg-slate-500/15 text-slate-600 dark:text-slate-400" },
};

export const SEED_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-1",
    title: "تطوير البنية السحابية لتقليل تكاليف التشغيل بنسبة ٢٥٪",
    category: "كفاءة التكاليف والأنظمة",
    priority: "high",
    impact: "توفير مالي وتقليل وقت الاستجابة",
    date: "2026-11-01",
    description: "بناءً على مراجعة الأداء الأخير، نوصي بترحيل خوادم البيانات إلى البيئة السحابية المحسنة لزيادة سرعة التحميل وخفض النفقات الدورية.",
    status: "active",
  },
  {
    id: "rec-2",
    title: "تفعيل نظام الأمان المزدوج (2FA) وتحديث بروتوكولات الحماية",
    category: "الأمان وحماية البيانات",
    priority: "high",
    impact: "حماية تامة من التهديدات السيبرانية",
    date: "2026-11-03",
    description: "تطبيق معايير التشفير المتقدمة لحسابات المؤسسة لضمان أمان الاتفاقيات والوثائق التعاقدية الحساسة.",
    status: "active",
  },
  {
    id: "rec-3",
    title: "تجديد اتفاقية الشراكة الاستراتيجية والتوسع الإقليمي",
    category: "التوسع ونمو الأعمال",
    priority: "medium",
    impact: "فتح قنوات تسويقية جديدة",
    date: "2026-10-25",
    description: "استثمار فرصة الربع القادم لتوقيع ملحق الشراكة الإقليمية لتعزيز الحصة السوقية في قطاع التجارة الرقمية.",
    status: "planned",
  },
  {
    id: "rec-4",
    title: "أتمتة الفواتير ومتابعة التحصيلات الدورية",
    category: "الإدارة المالية الذكية",
    priority: "normal",
    impact: "تسريع دورة التحصيل بنسبة ٤٠٪",
    date: "2026-10-18",
    description: "ربط بوابة الدفع بنظام الإشعارات التلقائية لتقليل فترات انتظار السداد وتسهيل التقارير المحاسبية.",
    status: "completed",
  },
];
