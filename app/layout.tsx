import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "أوبكيا | Opekia",
  description: "منصة شخصية وإدارية ذكية",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased dark:bg-navy-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
