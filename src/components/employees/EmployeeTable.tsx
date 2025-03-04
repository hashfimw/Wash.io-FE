// src/components/employees/EmployeeTable.tsx
import { useState } from "react";
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
import {
  Employee,
  Role,
  EmployeeWorkShift,
  WorkerStation,
} from "@/types/employee";

import { useEmployees } from "@/hooks/api/employees/useEmployee";
import { useEmployeeTable } from "@/hooks/api/employees/useEmployeeTable";
import { EmployeeTableFilters } from "./employee-form/employee-table-filters";
import { EmployeeDeleteAlert } from "./employee-form/employee-delete-alert";
import { TablePagination } from "../shared/usePagination";
import SwipeIndicator from "../swipeIndicator";

interface EmployeeTableProps {
  onEdit: (employee: Employee) => void;
}

export function EmployeeTable({ onEdit }: EmployeeTableProps) {
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
    sortBy,
    setSortBy,
    onResetFilters,
    selectedRole,
    onSearchChange,
    onOutletChange,
    onRoleChange,
    selectedOutlet,
  } = useEmployeeTable();

  const handleDelete = async () => {
    if (!deleteEmployeeId) return;

    try {
      setDeleteLoading(true);
      await deleteEmployee(deleteEmployeeId);
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      setDeleteEmployeeId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <TableSkeleton columns={7} rows={5} />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-4 bg-putih">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer "
                onClick={() =>
                  setSortBy({
                    field: "fullName",
                    direction:
                      sortBy.field === "fullName" && sortBy.direction === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Name{" "}
                {sortBy.field === "fullName" &&
                  (sortBy.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="px-16">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Work Shift</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Outlet</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  {employee.fullName}
                </TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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
