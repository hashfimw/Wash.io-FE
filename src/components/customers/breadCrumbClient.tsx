"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { UserTable } from "@/components/customers/userTable";
import { useUserTable } from "@/hooks/api/users/getUserTable";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

interface UserTableWithBreadcrumbProps {
  limit: number;
}

export function UserTableWithBreadcrumb({
  limit,
}: UserTableWithBreadcrumbProps) {
  const {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    searchQuery,
    handleSearch,
    handlePageChange,
  } = useUserTable({ limit }); // Menggunakan hook yang sudah ada

  const { setBreadcrumbItems } = useBreadcrumb();
  const params = useParams();
  const role = params.role as string;

  // Masih menggunakan useEffect, tetapi di dalam client component, bukan di halaman utama
  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([
      { label: roleName, href: `/dashboard/${role}` },
      { label: "Customers" },
    ]);
  }, [role, setBreadcrumbItems]);

  return (
    <UserTable
      users={users}
      loading={loading}
      error={error}
      searchQuery={searchQuery}
      onSearch={handleSearch}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
