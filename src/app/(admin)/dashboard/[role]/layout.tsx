// app/(dashboard)/[role]/layout.tsx
"use client";
import { notFound } from "next/navigation";

import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
import { DashboardLayout } from "@/components/layouts/dashboardLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/api/auth/useAdminAuth";
import Loading from "@/app/loading";
import { OutletAdminGuard, SuperAdminGuard } from "@/hoc/AdminGuard";

export default function RoleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { role: string };
}) {
  const validRoleParams = ["super-admin", "outlet-admin"];
  const { role } = params;

  if (!validRoleParams.includes(role)) {
    return notFound();
  }

  // // Convert URL parameter to component role format
  // const componentRole = role === "super-admin" ? "SUPER_ADMIN" : "OUTLET_ADMIN";

  const { user, getCurrentUser, loading } = useAdminAuth();
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
        role={user.role as "SUPER_ADMIN" | "OUTLET_ADMIN"}
        user={{
          name: user.fullName || "",
          email: user.email,
          avatar: user.avatar,
        }}
      >
        {role === "super-admin" ? (
          <SuperAdminGuard>{children}</SuperAdminGuard>
        ) : (
          <OutletAdminGuard>{children}</OutletAdminGuard>
        )}
      </DashboardLayout>
    </BreadcrumbProvider>
  );
}
