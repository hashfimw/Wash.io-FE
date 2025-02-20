// src/app/(dashboard)/layout.tsx
"use client";

import { DashboardLayout } from "@/components/layouts/dashboardLayout";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "",
    role: "SUPER_ADMIN" as const,
  };

  return (
    <BreadcrumbProvider>
      <DashboardLayout role={mockUser.role} user={mockUser}>
        {children}
      </DashboardLayout>
    </BreadcrumbProvider>
  );
}
