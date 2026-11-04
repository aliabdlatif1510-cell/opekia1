export interface Partnership {
  id: string;
  name: string;
  type: "strategic" | "tech" | "marketing" | "mou";
  field: string;
  status: "active" | "establishing" | "paused";
  contact: string;
  notes: string;
}

export interface ContractItem {
  id: string;
  title: string;
  party: string;
  value: number;
  startDate: string;
  endDate: string;
  progress: number;
  status: "active" | "review" | "expired";
  notes?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  client: string;
  estimatedValue: number;
  stage: "lead" | "proposal" | "negotiation" | "won";
  probability: number;
  expectedClose: string;
  notes?: string;
}

export const PARTNERSHIP_TYPES: Record<string, string> = {
  strategic: "شراكة استراتيجية",
  tech: "شراكة تقنية وتطوير",
  marketing: "شراكة تسويق وتوزيع",
  mou: "مذكرة تفاهم",
};

export const PARTNERSHIP_STATUS: Record<string, { label: string; style: string }> = {
  active: { label: "نشطة", style: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  establishing: { label: "قيد التأسيس", style: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  paused: { label: "متوقفة مؤقتاً", style: "bg-slate-500/15 text-slate-600 dark:text-slate-400" },
};

export const CONTRACT_STATUS: Record<string, { label: string; style: string }> = {
  active: { label: "ساري", style: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  review: { label: "قيد المراجعة", style: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  expired: { label: "منتهي", style: "bg-slate-500/15 text-slate-600 dark:text-slate-400" },
};

export const STAGE_CONFIG: Record<string, { label: string; style: string }> = {
  lead: { label: "استكشاف أولي", style: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300" },
  proposal: { label: "تقديم العرض", style: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  negotiation: { label: "مرحلة التفاوض", style: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  won: { label: "تم كسب الصفقة 🎉", style: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
};

export const SEED_PARTNERSHIPS: Partnership[] = [
  {
    id: "p1",
    name: "شركة النيل للتكنولوجيا",
    type: "strategic",
    field: "البنية التحتية السحابية",
    status: "active",
    contact: "م. كريم عادل",
    notes: "شراكة لتوسيع الخدمات الرقمية في السوق الإقليمي.",
  },
  {
    id: "p2",
    name: "أكاديمية المستقبل الدولية",
    type: "mou",
    field: "التدريب والتأهيل المهني",
    status: "active",
    contact: "د. هبة سالم",
    notes: "تقديم برامج معتمدة وتدريب الكوادر التقنية.",
  },
  {
    id: "p3",
    name: "مجموعة الهرم للحلول التقنية",
    type: "tech",
    field: "تكامل الأنظمة والعتاد",
    status: "establishing",
    contact: "أ. طارق محمود",
    notes: "في مرحلة الاتفاق النهائي على الشروط الفنية.",
  },
];

export const SEED_CONTRACTS: ContractItem[] = [
  {
    id: "c1",
    title: "عقد تطوير منصة التجارة الإلكترونية",
    party: "شركة النيل للتكنولوجيا",
    value: 280000,
    startDate: "2026-01-15",
    endDate: "2026-12-30",
    progress: 75,
    status: "active",
    notes: "المرحلة الرابعة تسلم نهاية الشهر.",
  },
  {
    id: "c2",
    title: "عقد توريد وصيانة أجهزة الشبكات",
    party: "مجموعة الهرم",
    value: 95000,
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    progress: 40,
    status: "active",
    notes: "الدفعة الثانية مستحقة بعد التفتيش الفني.",
  },
  {
    id: "c3",
    title: "عقد استشارات التحول الرقمي",
    party: "الشركة العربية للخدمات",
    value: 150000,
    startDate: "2025-06-01",
    endDate: "2026-05-31",
    progress: 100,
    status: "expired",
    notes: "تم إغلاق العقد وتسليم كافة المخرجات.",
  },
];

export const SEED_OPPORTUNITIES: Opportunity[] = [
  {
    id: "op1",
    title: "مشروع ميكنة العمليات الإدارية",
    client: "مستشفى الأمل التخصصي",
    estimatedValue: 180000,
    stage: "negotiation",
    probability: 80,
    expectedClose: "2026-11-20",
    notes: "بانتظار موافقة مجلس الإدارة على الصيغة المالية النهائية.",
  },
  {
    id: "op2",
    title: "تطوير تطبيق الهاتف للخدمات اللوجستية",
    client: "شركة السريع للشحن",
    estimatedValue: 90000,
    stage: "proposal",
    probability: 60,
    expectedClose: "2026-11-28",
    notes: "تم تسليم العرض الفني والمالي وجاري تحديد موعد العرض التقديمي.",
  },
  {
    id: "op3",
    title: "بوابة الخدمات الذاتية للموظفين",
    client: "مجموعة الشرق الصناعية",
    estimatedValue: 120000,
    stage: "lead",
    probability: 35,
    expectedClose: "2026-12-15",
    notes: "تم عقد الاجتماع الاستكشافي الأول وتحديد نطاق العمل المبدئي.",
  },
];
