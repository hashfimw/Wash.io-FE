"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
import { DashboardLayout } from "@/components/layouts/dashboardLayout";
import { useAdminAuth } from "@/hooks/api/auth/useAdminAuth";
import Loading from "@/app/loading";
import { OutletAdminGuard, SuperAdminGuard } from "@/hoc/AdminGuard";

function isValidRole(role: string): boolean {
  const validRoleParams = ["super-admin", "outlet-admin"];
  return validRoleParams.includes(role);
}

export default function RoleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { role: string };
}) {
  const { role } = params;
  const { user, loading: authLoading, checkAuth, getCurrentUser } = useAdminAuth();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  const initializeAuth = useCallback(async () => {
    if (!checkAuth()) {
      router.push("/login-admin");
      return;
    }

    try {
      await getCurrentUser();
      setTimeout(() => {
        setShowLoading(false);
      }, 3000);
    } catch (error) {
      console.error("Error fetching user:", error);
      setShowLoading(false);
    }

    setIsInitialized(true);
  }, [checkAuth, getCurrentUser, router]);

  useEffect(() => {
    if (!isValidRole(role)) {
      router.push("/404");
    }
  }, [role, router]);

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  if (authLoading || !isInitialized || showLoading) {
    return <Loading />;
  }

  if (!user) {
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
