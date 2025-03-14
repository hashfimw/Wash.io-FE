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
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);
  const { setBreadcrumbItems } = useBreadcrumb();
  const params = useParams();
  const role = params.role as string;
  const tableRefreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([
      { label: roleName, href: `/dashboard/${role}` },
      { label: "Employees", href: `/${role}/employees` },
    ]);
  }, [role, setBreadcrumbItems]);

  const handleEdit = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedEmployee(undefined);
  }, []);

  const handleSuccess = useCallback(() => {
    if (tableRefreshRef.current) {
      setTimeout(() => {
        tableRefreshRef.current?.();
      }, 100);
    }
    handleClose();
  }, [handleClose]);

  const setTableRefresh = useCallback((refreshFn: () => void) => {
    tableRefreshRef.current = refreshFn;
  }, []);

  const handleAddButtonClick = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">Manage Employees</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, and manage your employees</p>
        </div>
        <div className="w-full sm:w-auto">
          <Button onClick={handleAddButtonClick} className="w-full sm:w-auto" variant="oren">
            <Plus className="h-4 w-4 mr-2" />
            Add New Employee
          </Button>
        </div>
      </div>

      <div className="rounded-lg shadow-sm bg-white">
        <div className="p-4 sm:p-6">
          <EmployeeTable onEdit={handleEdit} onRefreshReady={setTableRefresh} />
        </div>
      </div>

      <EmployeeForm
        open={isFormOpen}
        onClose={handleClose}
        employee={selectedEmployee}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
