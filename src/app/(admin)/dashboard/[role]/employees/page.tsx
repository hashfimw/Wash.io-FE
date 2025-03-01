// src/app/(dashboard)/super-admin/employees/page.tsx
"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([
      { label: roleName, href: `/dashboard/${role}` },
      { label: "Bypass Requests" },
    ]);
  }, [role, setBreadcrumbItems]);

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setSelectedEmployee(undefined);
  };

  const handleSuccess = () => {
    // Refresh table data
    handleClose();
  };

  return (
    <div className="container mx-auto px-4 py-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            Manage Employees
          </h1>
          <p className="text-sm text-muted-foreground mt-1 sm:hidden">
            Add, edit and manage all your employees
          </p>
        </div>
        <div className="w-full sm:w-auto mt-2 sm:mt-0">
          <Button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto"
            variant="oren"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-2 sm:p-6">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <EmployeeTable onEdit={handleEdit} />
          </div>
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
