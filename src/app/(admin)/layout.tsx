// (dashboard)/layout.tsx
"use client";

import { AdminGuard } from "@/hoc/AdminGuard";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
