# أوبكيا | Opekia

منصة شخصية وإدارية ذكية مبنية بـ Next.js 14 (App Router) و TypeScript و Tailwind CSS.

## التشغيل محلياً أو في بيئة التطوير السحابية

```bash
npm install
npm run dev
```

افتح `http://localhost:3000` ثم اضغط **الدخول السريع (وضع المعاينة التجريبي)**.
البيانات في وضع المعاينة تُحفظ في `localStorage` ولا تحتاج أي مفاتيح.

## ربط Supabase (مجاني)

1. أنشئ مشروعاً جديداً على https://supabase.com (الخطة المجانية).
2. من **SQL Editor** نفّذ محتوى ملف `schema.sql`.
3. انسخ `Project URL` و `anon public key` من **Project Settings > API**.
4. أنشئ ملف `.env.local` بالقيم التالية (لا ترفعه إلى Git):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

5. ثبّت المكتبة `npm install @supabase/supabase-js` ثم استبدل منطق `localStorage` في
   `app/page.tsx` و `app/dashboard/work/page.tsx` باستدعاءات Supabase Auth وجدول `contracts`.

## النشر المجاني

ارفع المستودع إلى GitHub، ثم اربطه بـ **Vercel** أو **Cloudflare Pages**، وأضف متغيرات البيئة نفسها في لوحة الإعدادات.

## الهيكل

```
opekia/
├── app/
│   ├── layout.tsx              # RTL + خط Cairo
│   ├── globals.css
│   ├── page.tsx                # الدخول / إنشاء الحساب / وضع المعاينة
│   └── dashboard/
│       ├── layout.tsx          # الشريط الجانبي والعلوي + الوضع الليلي
│       ├── page.tsx            # تحويل إلى "شغلي"
│       ├── work/page.tsx       # وحدة الشراكات والعقود (CRUD كامل)
│       └── [section]/page.tsx  # صفحات "عائلتي" و "بيتي" (قريباً)
├── lib/contracts.ts            # الأنواع والبيانات الأولية
├── schema.sql
└── .env.example
```
