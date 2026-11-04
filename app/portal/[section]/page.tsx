import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Users, Home, CalendarDays, ListChecks, Archive, Receipt, Wrench, ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

type Meta = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  cards: { t: string; d: string; icon: LucideIcon }[];
};

const META: Record<string, Meta> = {
  family: {
    title: "قسم عائلتي — قريباً في أوبكيا",
    subtitle: "نعمل على أدوات تنظم حياتكم العائلية في مكان واحد.",
    icon: Users,
    cards: [
      { t: "الأجندة العائلية", d: "جدول مشترك للمواعيد والأنشطة لكل أفراد العائلة.", icon: CalendarDays },
      { t: "المهام والمناسبات", d: "تذكيرات بالمناسبات والمهام مع توزيعها بين الأفراد.", icon: ListChecks },
      { t: "الأرشيف العائلي", d: "حفظ الوثائق والذكريات المهمة بشكل آمن ومنظم.", icon: Archive },
    ],
  },
  home: {
    title: "قسم بيتي — قريباً في أوبكيا",
    subtitle: "أدوات لإدارة شؤون المنزل اليومية والتخطيط للمستقبل.",
    icon: Home,
    cards: [
      { t: "إدارة مصروفات المنزل", d: "تتبع الفواتير والمصروفات الشهرية بتقارير واضحة.", icon: Receipt },
      { t: "الصيانة الدورية", d: "جدولة مواعيد الصيانة وتذكيرات التجديد.", icon: Wrench },
      { t: "قوائم المشتريات والالتزامات", d: "قوائم ذكية تتحدث مع احتياجات البيت.", icon: ShoppingCart },
    ],
  },
};

export default function PortalSectionPage({ params }: { params: { section: string } }) {
  const meta = META[params.section];
  if (!meta) notFound();
  const Icon = meta.icon;

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center py-10 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-xl shadow-blue-500/30">
        <Icon size={36} />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{meta.title}</h1>
      <p className="mt-3 text-slate-500 dark:text-slate-400">{meta.subtitle}</p>
      <div className="mt-10 grid w-full gap-4 md:grid-cols-3">
        {meta.cards.map(({ t, d, icon: CardIcon }) => (
          <div
            key={t}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-start shadow-sm dark:border-white/10 dark:bg-slate-900/60"
          >
            <CardIcon className="mb-4 text-blue-500" size={26} />
            <h3 className="font-bold text-slate-900 dark:text-white">{t}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{d}</p>
            <span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-400">
              قريباً
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
