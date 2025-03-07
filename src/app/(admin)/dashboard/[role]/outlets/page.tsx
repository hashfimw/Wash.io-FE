// src/app/(Admin)/dashboard/[role]/outlets/page.tsx
import OutletsClient from "@/components/outlets/outletAdm-client";
import { Suspense } from "react";

export default async function OutletsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4 sm:p-6 space-y-6">
          <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 sm:p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded w-full max-w-md"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <OutletsClient />
    </Suspense>
  );
}
