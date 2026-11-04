export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import WorkClient from "./WorkClient";

export default function WorkPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>}>
      <WorkClient />
    </Suspense>
  );
}
