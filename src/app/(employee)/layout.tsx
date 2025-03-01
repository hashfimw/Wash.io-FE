"use client";

import { EmployeeGuard } from "@/hoc/EmployeeGuard";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <EmployeeGuard>{children}</EmployeeGuard>;
}
