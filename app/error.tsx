"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-2xl rounded-2xl border border-rose-500/30 bg-rose-950/20 p-6 shadow-2xl backdrop-blur">
        <h2 className="mb-2 text-xl font-bold text-rose-400">⚠️ خطأ في تشغيل التطبيق (Application Error)</h2>
        <p className="mb-4 text-sm text-slate-300">
          حدث خطأ أثناء تشغيل الصفحة. التفاصيل التقنية للخطأ موضحة أدناه لمساعدتك في معالجته:
        </p>

        <div className="mb-4 max-h-80 overflow-auto rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-rose-200">
          <div className="mb-1 font-bold text-rose-300">
            {error.name}: {error.message}
          </div>
          {error.digest && (
            <div className="mb-2 text-slate-400">Digest: {error.digest}</div>
          )}
          {error.stack && (
            <pre className="mt-2 whitespace-pre-wrap text-slate-300">{error.stack}</pre>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-400"
          >
            إعادة المحاولة (Try Again)
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            الرئيسية (Home)
          </button>
        </div>
      </div>
    </div>
  );
}
