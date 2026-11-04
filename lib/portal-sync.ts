import {
  SEED_PARTNERSHIPS,
  SEED_CONTRACTS,
  SEED_OPPORTUNITIES,
  type Partnership,
  type ContractItem,
  type Opportunity,
} from "./work-three";
import { type Recommendation } from "./recommendations";

export const KEY_PARTNERSHIPS = "opekia_work_partnerships";
export const KEY_CONTRACTS = "opekia_work_contracts_v2";
export const KEY_OPPORTUNITIES = "opekia_work_opportunities";

// Read raw admin inputs from storage with fallbacks
export function getAdminPartnerships(): Partnership[] {
  if (typeof window === "undefined") return SEED_PARTNERSHIPS;
  try {
    const raw = localStorage.getItem(KEY_PARTNERSHIPS);
    return raw ? JSON.parse(raw) : SEED_PARTNERSHIPS;
  } catch {
    return SEED_PARTNERSHIPS;
  }
}

export function getAdminContracts(): ContractItem[] {
  if (typeof window === "undefined") return SEED_CONTRACTS;
  try {
    const raw = localStorage.getItem(KEY_CONTRACTS);
    return raw ? JSON.parse(raw) : SEED_CONTRACTS;
  } catch {
    return SEED_CONTRACTS;
  }
}

export function getAdminOpportunities(): Opportunity[] {
  if (typeof window === "undefined") return SEED_OPPORTUNITIES;
  try {
    const raw = localStorage.getItem(KEY_OPPORTUNITIES);
    return raw ? JSON.parse(raw) : SEED_OPPORTUNITIES;
  } catch {
    return SEED_OPPORTUNITIES;
  }
}

const money = (n: number) =>
  n.toLocaleString("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });

// Dynamically synthesize recommendations directly linked to the admin's partnerships and contracts
export function generateRecommendationsFromAdminInputs(
  partnerships: Partnership[],
  contracts: ContractItem[],
  opportunities: Opportunity[]
): Recommendation[] {
  const recs: Recommendation[] = [];

  // 1. Recommendations derived from Contracts (التعاقدات)
  contracts.forEach((c, idx) => {
    const isCompleted = c.progress >= 100 || c.status === "expired";
    const isUrgent = c.progress < 50;

    if (isCompleted) {
      recs.push({
        id: `rec-c-${c.id || idx}`,
        title: `توثيق وأرشفة إنجاز تعاقد: ${c.title}`,
        category: "التعاقدات — إغلاق وتسليم",
        priority: "normal",
        impact: `تسليم نهائي للقيمة التعاقدية (${money(c.value)})`,
        date: c.endDate || "2026-12-31",
        description: `العقد مع (${c.party}) استكمل نسبة إنجاز ${c.progress}%. يُوصى بإصدار شهادة إتمام الأعمال وأرشفة الملفات الرسمية.`,
        status: "completed",
      });
    } else {
      recs.push({
        id: `rec-c-${c.id || idx}`,
        title: `خطة تسريع المرحلة الحالية لعقد: ${c.title}`,
        category: "التعاقدات — متابعة الإنجاز",
        priority: isUrgent ? "high" : "medium",
        impact: `استكمال المتبقي وتفادي تأخير التسليم المقرر في ${c.endDate}`,
        date: c.endDate || "2026-11-30",
        description: `الطرف المعني: (${c.party}). تم إنجاز ${c.progress}% بقيمة إجمالية ${money(c.value)}. ${
          c.notes ? `ملاحظات الإدارة: ${c.notes}` : "يُوصى بمراجعة متطلبات الدفعة القادمة."
        }`,
        status: "active",
      });
    }
  });

  // 2. Recommendations derived from Partnerships (الشراكات)
  partnerships.forEach((p, idx) => {
    const isEstablishing = p.status === "establishing";

    if (isEstablishing) {
      recs.push({
        id: `rec-p-${p.id || idx}`,
        title: `استكمال الشروط التأسيسية لشراكة: ${p.name}`,
        category: "الشراكات — قيد التأسيس",
        priority: "high",
        impact: `إطلاق التعاون الفعلي في مجال (${p.field})`,
        date: "2026-11-20",
        description: `مسؤول الاتصال: ${p.contact || "الإدارة"}. ${
          p.notes ? `الملاحظات المسجلة: ${p.notes}` : "يُوصى بجدولة اجتماع اعتماد الصيغة النهائية للشراكة."
        }`,
        status: "planned",
      });
    } else if (p.status === "active") {
      recs.push({
        id: `rec-p-${p.id || idx}`,
        title: `توسيع نطاق المبادرات المشتركة مع: ${p.name}`,
        category: "الشراكات — نمو وتوسع",
        priority: "medium",
        impact: `تعظيم الاستفادة المشتركة في مجال (${p.field})`,
        date: "2026-12-15",
        description: `شراكة نشطة ومعتمدة. يُوصى بطلب تقرير ربع سنوي عن مؤشرات الأداء والأنشطة المشتركة.`,
        status: "active",
      });
    }
  });

  // 3. Strategic Recommendations derived from high-value Opportunities (الفرص)
  opportunities.forEach((o, idx) => {
    if (o.stage === "proposal" || o.stage === "negotiation") {
      recs.push({
        id: `rec-o-${o.id || idx}`,
        title: `تجهيز اتفاقية الإغلاق لفرصة: ${o.title}`,
        category: "الفرص — حسم الصفقات",
        priority: "high",
        impact: `تحصيل عائد تقديري معتمد قدره (${money(o.estimatedValue)})`,
        date: o.expectedClose || "2026-11-25",
        description: `العميل المستهدف: (${o.client}). نسبة احتمالية النجاح ${o.probability}%. يُوصى بتقديم التسهيلات النهائية قبل تاريخ ${o.expectedClose}.`,
        status: "active",
      });
    }
  });

  // If list is empty, provide a clean foundational guidance
  if (recs.length === 0) {
    recs.push({
      id: "rec-default",
      title: "جاهزية تامة لبدء التعاقدات والمشاريع",
      category: "التخطيط الاستراتيجي",
      priority: "normal",
      impact: "إعداد خطة التشغيل المبدئية",
      date: new Date().toISOString().split("T")[0],
      description: "فور قيام إدارة المنصة بإدخال أي شراكة أو عقد أو فرصة لحسابك، ستظهر هنا توصيات تنفيذية ومالية ذكية ترتبط بها مباشرة وبشكل فوري.",
      status: "active",
    });
  }

  return recs;
}
