"use client";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useEffect } from "react";

// src/app/(dashboard)/super-admin/dashboard/page.tsx
export default function SuperAdminDashboard() {
  const { setBreadcrumbItems } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbItems([
      { label: "Super Admin", href: "/super-admin/dashboard" },
      { label: "Dashboard" },
    ]);
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
      {/* Content akan ditambahkan di sini */}
    </div>
  );
}
