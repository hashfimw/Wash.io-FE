// src/app/(dashboard)/super-admin/employees/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { Employee } from "@/types/employee";
import { EmployeeForm } from "@/components/employees/employee-form/employee-form";
import { useParams } from "next/navigation";

export default function EmployeesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<
    Employee | undefined
  >(undefined);
  const { setBreadcrumbItems } = useBreadcrumb();
  const params = useParams();
  const role = params.role as string;

  // Reference to the employee table for refresh operations
  const tableRefreshRef = useRef<(() => void) | null>(null);

  // Optimasi dengan useEffect untuk mengurangi re-rendering
  useEffect(() => {
    // Set correct breadcrumb based on the role
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([
      { label: roleName, href: `/dashboard/${role}` },
      { label: "Employees", href: `/${role}/employees` },
    ]);
  }, [role, setBreadcrumbItems]);

  // Optimasi dengan useCallback untuk fungsi handler
  const handleEdit = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedEmployee(undefined);
  }, []);

  const handleSuccess = useCallback(() => {
    // Refresh table data using the refresh function from the hook
    if (tableRefreshRef.current) {
      // Tambahkan timeout kecil untuk mencegah race condition
      setTimeout(() => {
        tableRefreshRef.current?.();
      }, 100);
    }
    handleClose();
  }, [handleClose]);

  // Function to set the refresh function from the table component - dengan useCallback
  const setTableRefresh = useCallback((refreshFn: () => void) => {
    tableRefreshRef.current = refreshFn;
  }, []);

  // Tombol Add optimasi dengan useCallback
  const handleAddButtonClick = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            Manage Employees
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Add, edit, and manage your employees
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Button
            onClick={handleAddButtonClick}
            className="w-full sm:w-auto"
            variant="oren"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-lg shadow-sm bg-white">
        <div className="p-4 sm:p-6">
          <EmployeeTable onEdit={handleEdit} onRefreshReady={setTableRefresh} />
        </div>
      </div>

      {/* Modal Form */}
      <EmployeeForm
        open={isFormOpen}
        onClose={handleClose}
        employee={selectedEmployee}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
