export const dynamic = "force-dynamic";

import { Suspense } from "react";
import WishesClient from "@/app/dashboard/wishes/WishesClient";

export default function PortalWishesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      }
    >
      <WishesClient />
    </Suspense>
  );
}
