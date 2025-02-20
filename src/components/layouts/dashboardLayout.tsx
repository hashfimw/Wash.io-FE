// src/components/layouts/dashboardLayout.tsx
"use client";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "SUPER_ADMIN" | "OUTLET_ADMIN";
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function DashboardLayout({
  children,
  role,
  user,
}: DashboardLayoutProps) {
  const { breadcrumbItems } = useBreadcrumb();

  return (
    <div className="flex min-h-screen bg-putih">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block bg-birtu">
        <Sidebar role={role} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pr-2">
        <Header
          user={user}
          breadcrumbItems={breadcrumbItems}
          role={role} // Pass role dari props, bukan hardcode "SUPER_ADMIN"
        />

        {/* Main Content Area dengan responsive padding */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
