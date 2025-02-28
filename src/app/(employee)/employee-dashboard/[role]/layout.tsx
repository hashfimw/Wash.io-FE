"use client";
import { notFound } from "next/navigation";

import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
import { DashboardLayout } from "@/components/layouts/dashboardLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/api/auth/useEmployeeAuth";
import Loading from "@/app/loading";
import { DriverGuard, WorkerGuard } from "@/hoc/EmployeeGuard";

export default function RoleLayout({ children, params }: { children: React.ReactNode; params: { role: string } }) {
  const validRoleParams = ["driver", "worker"];
  const { role } = params;

  if (!validRoleParams.includes(role)) {
    return notFound();
  }

  const { user, getCurrentUser, loading } = useAuth();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const userData = await getCurrentUser();

      if (!userData) {
        return;
      }

      setTimeout(() => {
        setShowLoading(false);
      }, 2000);
    };

    initAuth();
  }, [role, router]);

  if (loading || !user || showLoading) {
    return <Loading />;
  }

  return (
    <BreadcrumbProvider>
      <DashboardLayout
        role={user.role as "DRIVER" | "WORKER"}
        user={{
          name: user.fullName || "",
          email: user.email,
          avatar: user.avatar,
        }}
      >
        {role === "driver" ? <DriverGuard>{children}</DriverGuard> : <WorkerGuard>{children}</WorkerGuard>}
      </DashboardLayout>
    </BreadcrumbProvider>
  );
}
