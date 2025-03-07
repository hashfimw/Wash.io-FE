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

  // Gunakan memoized auth hook
  const { user, loading: authLoading, checkAuth, getCurrentUser } = useAdminAuth();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLoading, setShowLoading] = useState(true); // Tambahkan state loading eksplisit

  // Gunakan useCallback untuk mempertahankan referensi fungsi
  const initializeAuth = useCallback(async () => {
    // Periksa apakah sudah login (cek token)
    if (!checkAuth()) {
      router.push("/login-admin");
      return;
    }

    // Ambil data user jika perlu
    try {
      await getCurrentUser();

      // Tambahkan timeout untuk menampilkan loading setidaknya selama 1.5 detik
      setTimeout(() => {
        setShowLoading(false);
      }, 3000);
    } catch (error) {
      console.error("Error fetching user:", error);
      setShowLoading(false);
    }

    // Set initialized
    setIsInitialized(true);
  }, [checkAuth, getCurrentUser, router]);

  // Validasi role sekali saat mount
  useEffect(() => {
    if (!isValidRole(role)) {
      router.push("/404");
    }
  }, [role, router]);

  // Inisialisasi auth hanya sekali
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Jika masih loading, belum diinisialisasi, atau showLoading true
  if (authLoading || !isInitialized || showLoading) {
    return <Loading />;
  }

  // Pengecekan user
  if (!user) {
    return <Loading />;
  }

  // Render konten akhir
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
