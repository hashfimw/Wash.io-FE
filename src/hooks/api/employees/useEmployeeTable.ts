// src/hooks/api/employees/useEmployeeTable.ts
import { useCallback, useEffect, useState, useRef } from "react";

import { Employee, Role } from "@/types/employee";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useEmployees } from "./useEmployee";

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

  // Refs untuk optimasi
  const isMounted = useRef(false);
  const pendingUpdateRef = useRef(false);
  const lastFetchParamsRef = useRef<string | null>(null);

  // State for table data and loading
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // State for filters
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchInput, 600);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  const [sortBy, setSortBy] = useState<SortConfig>({
    field: searchParams.get("sortBy") || initialSortField,
    direction: (searchParams.get("sortOrder") as "asc" | "desc") || initialSortDirection,
  });

  const [selectedRole, setSelectedRole] = useState<Role | "">((searchParams.get("role") as Role) || "");

  const [selectedOutlet, setSelectedOutlet] = useState<number | null>(
    searchParams.get("outlet") ? Number(searchParams.get("outlet")) : null
  );

  // API hooks
  const { getEmployees, error: apiError } = useEmployees();
  const { getOutletById } = useOutlets();

  // Effect untuk menandai component mounted
  useEffect(() => {
    isMounted.current = true;

    // Pastikan untuk fetch data pada initial mount
    fetchEmployees();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Sync debounced search dengan search query dan URL
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      setSearchQuery(debouncedSearch);

      // Update URL dengan debounced search dan reset ke halaman 1
      if (isMounted.current && debouncedSearch !== searchParams.get("search")) {
        updateUrl({
          search: debouncedSearch || null,
          page: "1",
        });
      }
    }
  }, [debouncedSearch, searchParams]);

  // Update URL dengan parameter baru - dengan batching
  const updateUrl = useCallback(
    (newParams: Record<string, string | null>) => {
      // Update URL hanya jika sudah di-mount dan tidak ada request yang tertunda
      if (isMounted.current && !pendingUpdateRef.current) {
        pendingUpdateRef.current = true;

        // Gunakan setTimeout untuk batching
        setTimeout(() => {
          const params = new URLSearchParams(searchParams.toString());

          // Update params
          Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === "") {
              params.delete(key);
            } else {
              params.set(key, value);
            }
          });

          // Cek apakah params berubah untuk mencegah navigasi yang tidak perlu
          const newParamsString = params.toString();
          const currentParamsString = searchParams.toString();

          if (newParamsString !== currentParamsString) {
            router.push(`${pathname}?${newParamsString}`, { scroll: false });
          }

          pendingUpdateRef.current = false;
        }, 100);
      }
    },
    [pathname, router, searchParams]
  );

  // Fungsi fetch dengan memoization
  const fetchEmployees = useCallback(async () => {
    // Buat params key untuk tracking
    const paramsKey = JSON.stringify({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      role: selectedRole,
      outlet: selectedOutlet,
      sortBy: sortBy.field,
      sortOrder: sortBy.direction,
    });

    // Jika params sama dengan request terakhir, skip request tapi jangan skip update loading state
    if (lastFetchParamsRef.current === paramsKey && employees.length > 0) {
      console.log("Skipping duplicate fetch, using cached data");
      // PENTING: Tetap set loading ke false meskipun menggunakan data cache
      setIsLoading(false);
      return;
    }

    // Set params terakhir
    lastFetchParamsRef.current = paramsKey;

    try {
      // Selalu set loading ke true saat mulai fetch baru
      setIsLoading(true);

      console.log("Fetching employees with params:", {
        page: currentPage,
        limit: pageSize,
        sortBy: sortBy.field,
        sortOrder: sortBy.direction,
        search: searchQuery,
        role: selectedRole,
        outlet: selectedOutlet,
      });

      // Jika outlet dipilih, dapatkan nama outletnya
      let outletName;
      if (selectedOutlet !== null) {
        try {
          const outletData = await getOutletById(selectedOutlet);
          outletName = outletData?.outletName;
        } catch (error) {
          console.error("Error fetching outlet details:", error);
        }
      }

      // Prepare parameters untuk API call
      const params: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
        search?: string;
        role?: Role;
        outletName?: string;
      } = {
        page: currentPage,
        limit: pageSize,
        sortBy: sortBy.field,
        sortOrder: sortBy.direction,
      };

      // Tambahkan filter ke params
      if (searchQuery) params.search = searchQuery;
      if (selectedRole !== "") params.role = selectedRole;
      if (outletName) params.outletName = outletName;

      const response = await getEmployees(params);

      console.log("Received employee data:", response);

      // Update state jika component masih mounted
      if (isMounted.current) {
        setEmployees(response.employees || []);

        // Hitung total halaman dan item
        if (response.meta && typeof response.meta.total === "number") {
          console.log("Setting totalPages from meta.total:", response.meta.total);
          setTotalPages(response.meta.total);

          // Hitung perkiraan total item
          const estimatedItems = response.meta.total * pageSize;
          setTotalItems(estimatedItems);
        } else {
          // Fallback
          setTotalPages(1);
          setTotalItems(response.employees?.length || 0);
        }

        // PENTING: Selalu set loading ke false setelah data diupdate
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      if (isMounted.current) {
        setTotalPages(1); // Default to 1 page on error
        setIsLoading(false); // PENTING: Jangan lupa set loading ke false pada error juga
      }
    }
  }, [
    currentPage,
    pageSize,
    searchQuery,
    selectedRole,
    selectedOutlet,
    sortBy,
    getOutletById,
    getEmployees,
    employees.length,
  ]);

  // Effect untuk fetch data saat parameters berubah
  useEffect(() => {
    // Gunakan setTimeout untuk mencegah terlalu banyak request saat parameter berubah cepat
    const timeoutId = setTimeout(() => {
      fetchEmployees();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [
    currentPage,
    sortBy.field,
    sortBy.direction,
    selectedRole,
    selectedOutlet,
    searchQuery,
    fetchEmployees,
  ]);

  // Handler functions with useCallback
  const handleSearchChange = useCallback((value: string) => {
    console.log("Search changed to:", value);
    setSearchInput(value);
  }, []);

  const handleRoleChange = useCallback(
    (role: Role | "") => {
      // Show loading state immediately when changing role
      setIsLoading(true);
      setSelectedRole(role);
      setCurrentPage(1);
      updateUrl({
        role: role || null,
        page: "1",
      });
    },
    [updateUrl]
  );

  const handleOutletChange = useCallback(
    async (outletId: number | null) => {
      // Show loading state immediately when changing outlet
      setIsLoading(true);
      setSelectedOutlet(outletId);
      setCurrentPage(1);

      // Update URL with outlet ID
      updateUrl({
        outlet: outletId !== null ? outletId.toString() : null,
        page: "1",
      });
    },
    [updateUrl]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      // Show loading state immediately when changing page
      setIsLoading(true);
      setCurrentPage(page);
      updateUrl({ page: page.toString() });
    },
    [updateUrl]
  );

  const handleSortChange = useCallback(
    (newSortConfig: SortConfig) => {
      // Show loading state immediately when changing sort
      setIsLoading(true);
      setSortBy(newSortConfig);
      updateUrl({
        sortBy: newSortConfig.field,
        sortOrder: newSortConfig.direction,
        page: "1", // Reset to first page on sort change
      });
    },
    [updateUrl]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    // Show loading state immediately when resetting filters
    setIsLoading(true);

    // Invalidate params cache
    lastFetchParamsRef.current = null;

    // Reset all state
    setSearchInput("");
    setSearchQuery("");
    setSelectedRole("");
    setSelectedOutlet(null);
    setCurrentPage(1);
    setSortBy({ field: initialSortField, direction: initialSortDirection });

    // Clear all query params from URL and refresh data
    router.push(pathname);
  }, [pathname, router, initialSortField, initialSortDirection]);

  // Expose refresh function dengan jeda agar tidak overload
  const refresh = useCallback(() => {
    setIsLoading(true);

    // Invalidate params cache
    lastFetchParamsRef.current = null;

    // Jeda untuk mencegah multiple requests
    setTimeout(() => {
      fetchEmployees();
    }, 100);
  }, [fetchEmployees]);

  return {
    // Data
    employees,
    loading: isLoading,
    error: apiError,
    totalPages,
    totalItems,

    // Pagination
    currentPage,
    setCurrentPage: handlePageChange,

    // Search and filter
    searchQuery: searchInput, // Keep using searchInput for the UI to prevent jumps during typing
    onSearchChange: handleSearchChange,
    selectedRole,
    onRoleChange: handleRoleChange,
    selectedOutlet,
    onOutletChange: handleOutletChange,

    // Sorting
    sortBy,
    setSortBy: handleSortChange,

    // Actions
    onResetFilters: resetFilters,
    refresh,
  };
}
