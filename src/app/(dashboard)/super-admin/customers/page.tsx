// src/app/(dashboard)/super-admin/customers/page.tsx
"use client";

import { useEffect } from "react";

import { useBreadcrumb } from "@/context/BreadcrumbContext";

import { UserTable } from "@/components/customers/userTable";
import { useUserTable } from "@/hooks/api/users/getUserTable";

export default function CustomersPage() {
  const {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    searchQuery,
    handleSearch,
    handlePageChange,
  } = useUserTable({ limit: 5 }); // Sesuaikan limit dengan kebutuhan

  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbItems([
      { label: "Super Admin", href: "/super-admin/dashboard" },
      { label: "Customers" },
    ]);
  }, [setBreadcrumbItems]);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            Customers List
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View all registered customers
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 sm:p-6 ">
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
        </div>
      </div>
    </div>
  );
}
