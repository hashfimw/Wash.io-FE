"use client";

import { useEffect, useMemo } from "react";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useUserTable } from "@/hooks/api/users/getUserTable";
import { UserTable } from "./userTable";
import { useParams } from "next/navigation";

interface UserTableWithBreadcrumbProps {
  limit?: number;
}

export function UserTableWithBreadcrumb({ limit = 5 }: UserTableWithBreadcrumbProps) {
  const { setBreadcrumbItems } = useBreadcrumb();
  const params = useParams();
  const role = Array.isArray(params.role) ? params.role[0] : params.role || "outlet-admin";

  const { users, loading, error, currentPage, totalPages, searchQuery, handleSearch, handlePageChange } =
    useUserTable({ limit });

  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([{ label: roleName, href: `/dashboard/${role}` }, { label: "Laundry Items" }]);
  }, [role, setBreadcrumbItems]);

  const userTableComponent = useMemo(
    () => (
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
    ),
    [users, loading, error, searchQuery, handleSearch, currentPage, totalPages, handlePageChange]
  );

  return userTableComponent;
}
