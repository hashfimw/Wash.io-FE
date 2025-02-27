// app/(dashboard)/[role]/layout.tsx
"use client";
import { notFound } from "next/navigation";

import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
import { DashboardLayout } from "@/components/layouts/dashboardLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/api/auth/useAdminAuth";
import Loading from "@/app/loading";
import { OutletAdminGuard, SuperAdminGuard } from "@/hoc/AdminGuard";

export default function RoleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { role: string };
}) {
  // Validate the role parameter from URL
  const validRoleParams = ["super-admin", "outlet-admin"];
  const { role } = params;

  // Validate role parameter
  if (!validRoleParams.includes(role)) {
    return notFound();
  }

  // Convert URL parameter to component role format
  const componentRole = role === "super-admin" ? "SUPER_ADMIN" : "OUTLET_ADMIN";

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

  // Show loading state if explicitly loading, no user yet, or within minimum display time
  if (loading || !user || showLoading) {
    return <Loading />;
  }

  // Render content with appropriate guard based on role
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
