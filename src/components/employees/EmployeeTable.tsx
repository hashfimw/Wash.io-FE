// src/components/employees/EmployeeTable.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Employee, Role } from "@/types/employee";

import { useEmployeeTable } from "@/hooks/api/employees/useEmployeeTable";
import { EmployeeTableFilters } from "./employee-form/employee-table-filters";
import { EmployeeDeleteAlert } from "./employee-form/employee-delete-alert";
import { TablePagination } from "../shared/usePagination";
import SwipeIndicator from "../swipeIndicator";
import { useEmployees } from "@/hooks/api/employees/useEmployee";

interface EmployeeTableProps {
  onEdit: (employee: Employee) => void;
  onRefreshReady?: (refreshFn: () => void) => void;
}

export function EmployeeTable({ onEdit, onRefreshReady }: EmployeeTableProps) {
  const { toast } = useToast();
  const { deleteEmployee } = useEmployees();
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    employees,
    loading,
    error,
    searchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    sortBy,
    setSortBy,
    onResetFilters,
    selectedRole,
    onSearchChange,
    onOutletChange,
    onRoleChange,
    selectedOutlet,
    refresh,
  } = useEmployeeTable();

  // Expose the refresh function to the parent component
  useEffect(() => {
    if (onRefreshReady) {
      onRefreshReady(refresh);
    }
  }, [onRefreshReady, refresh]);

  // Optimasi dengan useCallback untuk fungsi handler
  const handleDelete = useCallback(async () => {
    if (!deleteEmployeeId) return;

    try {
      setDeleteLoading(true);
      await deleteEmployee(deleteEmployeeId);
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      setDeleteEmployeeId(null);

      // Refresh the employee list after deletion
      refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteEmployeeId, deleteEmployee, toast, refresh]);

  // Optimasi dengan useCallback untuk sort handler
  const handleSort = useCallback(
    (field: string) => {
      setSortBy({
        field,
        direction:
          sortBy.field === field && sortBy.direction === "asc" ? "desc" : "asc",
      });
    },
    [sortBy, setSortBy]
  );

  // Memoize employee rows untuk mencegah re-render berulang
  const employeeRows = useMemo(() => {
    if (employees.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-6">
            No employees found
          </TableCell>
        </TableRow>
      );
    }

    return employees.map((employee) => (
      <TableRow key={employee.id}>
        <TableCell className="font-medium">{employee.fullName}</TableCell>
        <TableCell>{employee.email}</TableCell>
        <TableCell>
          {employee.role
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/^\w|\s\w/g, (c) => c.toUpperCase())}
        </TableCell>
        <TableCell>
          {employee.Employee?.workShift
            ? employee.Employee.workShift
                .toLowerCase()
                .replace(/^\w|\s\w/g, (c) => c.toUpperCase())
            : ""}
        </TableCell>

        <TableCell>
          {employee.Employee?.station
            ? employee.Employee.station
                .toLowerCase()
                .replace(/^\w|\s\w/g, (c) => c.toUpperCase())
            : ""}
        </TableCell>
        <TableCell>{employee.Employee?.outlet?.outletName}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(employee)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteEmployeeId(employee.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  }, [employees, onEdit]);

  // Memoize skeleton loading UI
  const loadingSkeleton = useMemo(() => {
    return <TableSkeleton columns={7} rows={5} />;
  }, []);

  // Memoize error UI
  const errorUI = useMemo(() => {
    if (!error) return null;

    return (
      <div className="text-red-500 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="font-semibold">Error loading employees</p>
        <p>{error}</p>
      </div>
    );
  }, [error]);

  // Memoize info text about displayed items
  const itemsInfoText = useMemo(() => {
    if (employees.length > 0 && !loading) {
      return (
        <>
          Showing {employees.length}{" "}
          {employees.length === 1 ? "employee" : "employees"}{" "}
          {totalItems > 0 ? `of ${totalItems}` : ""}
        </>
      );
    }
    return null;
  }, [employees.length, loading, totalItems]);

  return (
    <div className="space-y-4 bg-white">
      <EmployeeTableFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedRole={selectedRole}
        onRoleChange={onRoleChange}
        selectedOutlet={selectedOutlet}
        onOutletChange={onOutletChange}
        onResetFilters={onResetFilters}
      />

      <div className="rounded-md border">
        <SwipeIndicator className="md:hidden" />
        {loading ? (
          loadingSkeleton
        ) : error ? (
          errorUI
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("fullName")}
                >
                  Name{" "}
                  {sortBy.field === "fullName" &&
                    (sortBy.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="px-16">Email</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("role")}
                >
                  Role{" "}
                  {sortBy.field === "role" &&
                    (sortBy.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Work Shift</TableHead>
                <TableHead>Station</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("outletName")}
                >
                  Outlet{" "}
                  {sortBy.field === "outletName" &&
                    (sortBy.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{employeeRows}</TableBody>
          </Table>
        )}
      </div>

      {/* Pagination section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
        <div className="text-sm text-muted-foreground">{itemsInfoText}</div>

        {!loading && totalPages > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            disabled={loading}
          />
        )}
      </div>

      <EmployeeDeleteAlert
        open={!!deleteEmployeeId}
        onClose={() => setDeleteEmployeeId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
