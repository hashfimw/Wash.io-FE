"use client";

import { DashboardLayout } from "@/components/layouts/dashboardLayout";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
// Import the Loading component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/api/auth/useAdminAuth";
import Loading from "../loading";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, getCurrentUser, loading } = useAuth();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true); // Added state to control loading display

  useEffect(() => {
    const initAuth = async () => {
      const userData = await getCurrentUser();
      if (!userData) {
        router.push("/login-admin");
        return;
      }

      // Add minimum loading time of 5 seconds to ensure animations are seen
      setTimeout(() => {
        setShowLoading(false);
      }, 4000);
    };

    initAuth();
  }, []);

  // Show loading state if explicitly loading, no user yet, or within minimum display time
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
        {children}
      </DashboardLayout>
    </BreadcrumbProvider>
  );
}
