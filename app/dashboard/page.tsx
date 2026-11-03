"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/work");
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
    </div>
  );
}

export default function DashboardIndex() {
  return (
    <Suspense fallback={null}>
      <DashboardRedirect />
    </Suspense>
  );
}
