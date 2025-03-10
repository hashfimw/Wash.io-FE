"use client";

import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "SUPER_ADMIN" | "OUTLET_ADMIN" | "DRIVER" | "WORKER";
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function DashboardLayout({ children, role, user }: DashboardLayoutProps) {
  const { breadcrumbItems } = useBreadcrumb();

  return (
    <div className="flex min-h-screen bg-putih">
      <div className="hidden lg:block rounded-br-2xl bg-birtu">
        <Sidebar role={role} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 pr-2">
        <Header user={user} breadcrumbItems={breadcrumbItems} role={role} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
