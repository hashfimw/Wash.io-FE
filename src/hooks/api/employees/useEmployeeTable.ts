// src/hooks/api/employees/useEmployeeTable.ts
import { useEffect, useState } from "react";
import { useEmployees } from "./useEmployee";
import { Employee, Role } from "@/types/employee";
import { Outlet } from "@/types/outlet";

interface UseEmployeeTableProps {
  pageSize?: number;
}

export function useEmployeeTable({
  pageSize = 10,
}: UseEmployeeTableProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [selectedOutlet, setSelectedOutlet] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<{
    field: string;
    direction: "asc" | "desc";
  }>({
    field: "fullName",
    direction: "asc",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const { loading, error, getEmployees } = useEmployees();

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployees();
        console.log("Response from API:", response); // Debug response
        console.log("Data from API:", response.data); // Debug data
        if (response.data) {
          setEmployees(response.data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // Debug: lihat nilai employees setelah di-set
  console.log("Current employees state:", employees);

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      (employee?.fullName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (employee?.email || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole ? employee?.role === selectedRole : true;

    const matchesOutlet = selectedOutlet
      ? employee?.Employee?.outlet?.id === selectedOutlet
      : true;

    return matchesSearch && matchesRole && matchesOutlet;
  });

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    // Handle nested properties
    if (sortBy.field === "fullName") {
      aValue = a.fullName;
      bValue = b.fullName;
    } else if (sortBy.field === "email") {
      aValue = a.email;
      bValue = b.email;
    } else if (sortBy.field === "role") {
      aValue = a.role;
      bValue = b.role;
    } else {
      aValue = (a as any)[sortBy.field];
      bValue = (b as any)[sortBy.field];
    }

    // Handle null values
    if (aValue === null) aValue = "";
    if (bValue === null) bValue = "";

    return sortBy.direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Paginate employees
  const totalPages = Math.ceil(sortedEmployees.length / pageSize);
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearchQuery("");
    setCurrentPage(1);
    setSelectedRole("");
    setSelectedOutlet(null);
    setSortBy({ field: "fullName", direction: "asc" });
  };

  return {
    employees: paginatedEmployees,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    sortBy,
    setSortBy,
    selectedRole,
    setSelectedRole,
    selectedOutlet,
    setSelectedOutlet,
    resetFilters,
  };
}
