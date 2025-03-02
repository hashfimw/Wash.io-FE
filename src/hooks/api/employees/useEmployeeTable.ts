// src/hooks/api/employees/useEmployeeTable.ts
import { useCallback, useEffect, useState } from "react";

import { Employee, Role } from "@/types/employee";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { useEmployees } from "./useEmployee";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

interface UseEmployeeTableProps {
  pageSize?: number;
  initialSortField?: string;
  initialSortDirection?: "asc" | "desc";
}

export function useEmployeeTable({
  pageSize = 10,
  initialSortField = "fullName",
  initialSortDirection = "asc",
}: UseEmployeeTableProps = {}) {
  // Search and pagination state
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const debounceSearch = useDebounce(searchInput, 600);

  // Setelah debounce, update URL dan searchQuery
  useEffect(() => {
    // Update searchQuery agar sinkron dengan nilai debounced
    setSearchQuery(debounceSearch);

    // Update URL dengan nilai pencarian yang sudah di-debounce
    updateUrl({
      search: debounceSearch || null,
      page: "1",
    });
  }, [debounceSearch]);

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [sortBy, setSortBy] = useState<SortConfig>({
    field: initialSortField,
    direction: initialSortDirection,
  });
  const [selectedRole, setSelectedRole] = useState<Role | "">(
    (searchParams.get("role") as Role) || ""
  );
  const [selectedOutlet, setSelectedOutlet] = useState<number | null>(
    searchParams.get("outlet") ? Number(searchParams.get("outlet")) : null
  );

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { loading, error, getEmployees } = useEmployees();
  const { getOutletById } = useOutlets();

  // Effect untuk fetch data berdasarkan perubahan params
  useEffect(() => {
    fetchEmployees();
  }, [
    searchParams,
    currentPage,
    sortBy,
    selectedRole,
    selectedOutlet,
    pageSize,
    searchQuery, // Tambahkan searchQuery ke dependencies
  ]);

  // Ini untuk membersihkan URL hanya sekali pada render pertama jika diperlukan
  // Sebaiknya di-comment jika menyebabkan masalah atau tidak diperlukan
  /*
  useEffect(() => {
    // Cek jika ada query params
    if (searchParams.toString()) {
      // Bersihkan URL ke path awal
      router.push(pathname);
    }
  }, []);
  */

  const fetchEmployees = async () => {
    try {
      console.log("Fetching with search:", searchQuery); // Debugging log

      let outletName;
      if (selectedOutlet !== null) {
        const outletData = await getOutletById(selectedOutlet);
        outletName = outletData?.outletName;
      }

      // Persiapkan parameter untuk API call
      const params: any = {
        page: currentPage,
        limit: pageSize,
        sortBy: sortBy.field,
        sortOrder: sortBy.direction,
      };

      // Gunakan searchQuery yang sudah diupdate dari debounceSearch
      if (searchQuery) params.search = searchQuery;
      if (selectedRole !== "") params.role = selectedRole;
      if (outletName) params.outletName = outletName;

      const response = await getEmployees(params);
      setEmployees(response.employees);
      setTotalPages(response.meta.total);
      setTotalItems(response.meta.total * pageSize);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const updateUrl = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    console.log("Search changed to:", value); // Debugging log
    setSearchInput(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (role: Role | "") => {
    setSelectedRole(role);
    setCurrentPage(1);
    updateUrl({ role: role || null, page: "1" });
  };

  const handleOutletChange = async (outletId: number | null) => {
    setSelectedOutlet(outletId);
    setCurrentPage(1);

    // Jika ada outletId, dapatkan nama outletnya
    let outletName = null;
    if (outletId !== null) {
      const outletData = await getOutletById(outletId);
      outletName = outletData?.outletName || null;
    }

    // Update URL dengan outletName
    updateUrl({
      outlet: outletId !== null ? outletId.toString() : null,
      page: "1",
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl({ page: page.toString() });
  };

  // Reset semua filter
  const resetFilters = useCallback(() => {
    // Reset semua state
    setSearchInput("");
    setSearchQuery("");
    setSelectedRole("");
    setSelectedOutlet(null);
    setCurrentPage(1);
    setSortBy({ field: initialSortField, direction: initialSortDirection });

    // Hapus semua query params dari URL dan refresh data
    router.push(pathname);
    fetchEmployees();
  }, [pathname, router, initialSortField, initialSortDirection]);

  return {
    // Data
    employees,
    loading,
    error,
    totalPages,
    totalItems,

    // Pagination
    currentPage,
    setCurrentPage: handlePageChange,

    // Search dan filter yang sesuai dengan props EmployeeTableFilters
    searchQuery: searchInput,
    onSearchChange: handleSearchChange,
    selectedRole,
    onRoleChange: handleRoleChange,
    selectedOutlet,
    onOutletChange: handleOutletChange,

    // Sorting
    sortBy,
    setSortBy,

    // Actions
    onResetFilters: resetFilters,
    refresh: fetchEmployees,
  };
}
