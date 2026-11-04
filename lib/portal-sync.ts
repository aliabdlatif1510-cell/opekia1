import {
  SEED_PARTNERSHIPS,
  SEED_CONTRACTS,
  SEED_OPPORTUNITIES,
  PARTNERSHIP_STATUS,
  PARTNERSHIP_TYPES,
  CONTRACT_STATUS,
  STAGE_CONFIG,
  type Partnership,
  type ContractItem,
  type Opportunity,
} from "./work-three";
import { SEED_RECOMMENDATIONS, type Recommendation } from "./recommendations";

export const KEY_PARTNERSHIPS = "opekia_work_partnerships";
export const KEY_CONTRACTS = "opekia_work_contracts_v2";
export const KEY_OPPORTUNITIES = "opekia_work_opportunities";
export const KEY_RECOMMENDATIONS = "opekia_work_recommendations";

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

export function getAdminRecommendations(): Recommendation[] {
  if (typeof window === "undefined") return SEED_RECOMMENDATIONS;
  try {
    const raw = localStorage.getItem(KEY_RECOMMENDATIONS);
    return raw ? JSON.parse(raw) : SEED_RECOMMENDATIONS;
  } catch {
    return SEED_RECOMMENDATIONS;
  }
}

const money = (n: number) =>
  n.toLocaleString("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });

// Dynamically synthesize recommendations directly linked to the admin's partnerships, contracts, and opportunities
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

  // 3. Strategic Recommendations derived from Opportunities (الفرص)
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

// Combines direct admin recommendations with dynamically synthesized ones
export function getAllRecommendations(
  adminRecs: Recommendation[],
  partnerships: Partnership[],
  contracts: ContractItem[],
  opportunities: Opportunity[]
): Recommendation[] {
  const dynamic = generateRecommendationsFromAdminInputs(partnerships, contracts, opportunities);
  const seenIds = new Set<string>();
  const combined: Recommendation[] = [];

  // 1. Direct admin recommendations first
  adminRecs.forEach((r) => {
    if (!seenIds.has(r.id)) {
      seenIds.add(r.id);
      combined.push(r);
    }
  });

  // 2. Dynamic recommendations from contracts / partnerships / opportunities
  dynamic.forEach((r) => {
    if (!seenIds.has(r.id) && r.id !== "rec-default") {
      seenIds.add(r.id);
      combined.push(r);
    }
  });

  if (combined.length === 0) {
    return dynamic;
  }

  return combined;
}

// =====================================================================
// UNIFIED CLIENT OPPORTUNITIES:
// Links ALL THREE Admin inputs (الشراكات، التعاقدات، والفرص)
// directly to the Opportunities box in the Client Portal!
// =====================================================================
export interface ClientOpportunityItem {
  id: string;
  sourceType: "opportunity" | "contract" | "partnership";
  sourceLabel: string;
  sourceBadgeStyle: string;
  sourceColor: "amber" | "emerald" | "blue";
  title: string;
  counterparty: string;
  counterpartyLabel: string;
  value: number;
  valueDisplay: string;
  stageLabel: string;
  stageStyle: string;
  date: string;
  dateLabel: string;
  metricPercentage?: number;
  metricLabel?: string;
  notes: string;
}

export function getUnifiedClientOpportunities(
  opportunities: Opportunity[],
  contracts: ContractItem[],
  partnerships: Partnership[]
): ClientOpportunityItem[] {
  const list: ClientOpportunityItem[] = [];

  // 1. Commercial / Deal Opportunities (الفرص التجارية والاستثمارية)
  opportunities.forEach((o) => {
    const stageCfg = STAGE_CONFIG[o.stage] || STAGE_CONFIG.lead;
    list.push({
      id: `opp-${o.id}`,
      sourceType: "opportunity",
      sourceLabel: "فرصة تجارية",
      sourceBadgeStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      sourceColor: "amber",
      title: o.title,
      counterparty: o.client,
      counterpartyLabel: "العميل المستهدف",
      value: o.estimatedValue,
      valueDisplay: money(o.estimatedValue),
      stageLabel: stageCfg.label,
      stageStyle: stageCfg.style,
      date: (o as any).date || o.expectedClose || "2026-11-04",
      dateLabel: "الإغلاق المتوقع",
      metricPercentage: o.probability,
      metricLabel: "احتمالية الإغلاق",
      notes: o.notes || "فرصة استثمارية وتجارية جارية في مسار الصفقات.",
    });
  });

  // 2. Contractual Opportunities (فرص التعاقدات والاتفاقيات)
  contracts.forEach((c) => {
    const statusCfg = CONTRACT_STATUS[c.status] || CONTRACT_STATUS.active;
    list.push({
      id: `opp-c-${c.id}`,
      sourceType: "contract",
      sourceLabel: "فرصة تعاقد ملزم",
      sourceBadgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      sourceColor: "emerald",
      title: c.title,
      counterparty: c.party,
      counterpartyLabel: "الجهة المتعاقدة",
      value: c.value,
      valueDisplay: money(c.value),
      stageLabel: statusCfg.label,
      stageStyle: statusCfg.style,
      date: (c as any).date || c.endDate || "2026-11-04",
      dateLabel: "نهاية التعاقد",
      metricPercentage: c.progress,
      metricLabel: "نسبة التنفيذ",
      notes: c.notes || `عقد ساري بقيمة تعاقدية معتمدة ${money(c.value)}.`,
    });
  });

  // 3. Strategic Partnership Opportunities (فرص الشراكات والتعاون)
  partnerships.forEach((p) => {
    const statusCfg = PARTNERSHIP_STATUS[p.status] || PARTNERSHIP_STATUS.active;
    const typeLabel = PARTNERSHIP_TYPES[p.type] || p.type;
    list.push({
      id: `opp-p-${p.id}`,
      sourceType: "partnership",
      sourceLabel: "فرصة شراكة استراتيجية",
      sourceBadgeStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      sourceColor: "blue",
      title: p.name,
      counterparty: p.contact ? `${p.field} — ${p.contact}` : p.field,
      counterpartyLabel: "مجال الشراكة والتواصل",
      value: 0,
      valueDisplay: typeLabel,
      stageLabel: statusCfg.label,
      stageStyle: statusCfg.style,
      date: (p as any).date || "نشطة ومستمرة",
      dateLabel: "حالة التعاون",
      notes: p.notes || `شراكة معتمدة لفتح آفاق التعاون والتوسع في قطاع ${p.field}.`,
    });
  });

  return list;
}
