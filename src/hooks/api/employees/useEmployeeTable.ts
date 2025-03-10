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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMounted = useRef(false);
  const pendingUpdateRef = useRef(false);
  const lastFetchParamsRef = useRef<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
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

  const { getEmployees, error: apiError } = useEmployees();
  const { getOutletById } = useOutlets();

  useEffect(() => {
    isMounted.current = true;

    fetchEmployees();

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      setSearchQuery(debouncedSearch);

      if (isMounted.current && debouncedSearch !== searchParams.get("search")) {
        updateUrl({
          search: debouncedSearch || null,
          page: "1",
        });
      }
    }
  }, [debouncedSearch, searchParams]);

  const updateUrl = useCallback(
    (newParams: Record<string, string | null>) => {
      if (isMounted.current && !pendingUpdateRef.current) {
        pendingUpdateRef.current = true;

        setTimeout(() => {
          const params = new URLSearchParams(searchParams.toString());

          Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === "") {
              params.delete(key);
            } else {
              params.set(key, value);
            }
          });

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

  const fetchEmployees = useCallback(async () => {
    const paramsKey = JSON.stringify({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      role: selectedRole,
      outlet: selectedOutlet,
      sortBy: sortBy.field,
      sortOrder: sortBy.direction,
    });

    if (lastFetchParamsRef.current === paramsKey && employees.length > 0) {
      console.log("Skipping duplicate fetch, using cached data");
      setIsLoading(false);
      return;
    }

    lastFetchParamsRef.current = paramsKey;

    try {
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
      let outletName;
      if (selectedOutlet !== null) {
        try {
          const outletData = await getOutletById(selectedOutlet);
          outletName = outletData?.outletName;
        } catch (error) {
          console.error("Error fetching outlet details:", error);
        }
      }

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

      if (searchQuery) params.search = searchQuery;
      if (selectedRole !== "") params.role = selectedRole;
      if (outletName) params.outletName = outletName;

      const response = await getEmployees(params);

      if (isMounted.current) {
        setEmployees(response.employees || []);

        if (response.meta && typeof response.meta.total === "number") {
          console.log("Setting totalPages from meta.total:", response.meta.total);
          setTotalPages(response.meta.total);
          const estimatedItems = response.meta.total * pageSize;
          setTotalItems(estimatedItems);
        } else {
          setTotalPages(1);
          setTotalItems(response.employees?.length || 0);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      if (isMounted.current) {
        setTotalPages(1);
        setIsLoading(false);
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

  useEffect(() => {
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

  const handleSearchChange = useCallback((value: string) => {
    console.log("Search changed to:", value);
    setSearchInput(value);
  }, []);

  const handleRoleChange = useCallback(
    (role: Role | "") => {
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
      setIsLoading(true);
      setSelectedOutlet(outletId);
      setCurrentPage(1);
      updateUrl({
        outlet: outletId !== null ? outletId.toString() : null,
        page: "1",
      });
    },
    [updateUrl]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setIsLoading(true);
      setCurrentPage(page);
      updateUrl({ page: page.toString() });
    },
    [updateUrl]
  );

  const handleSortChange = useCallback(
    (newSortConfig: SortConfig) => {
      setIsLoading(true);
      setSortBy(newSortConfig);
      updateUrl({
        sortBy: newSortConfig.field,
        sortOrder: newSortConfig.direction,
        page: "1",
      });
    },
    [updateUrl]
  );

  const resetFilters = useCallback(() => {
    setIsLoading(true);
    lastFetchParamsRef.current = null;
    setSearchInput("");
    setSearchQuery("");
    setSelectedRole("");
    setSelectedOutlet(null);
    setCurrentPage(1);
    setSortBy({ field: initialSortField, direction: initialSortDirection });
    router.push(pathname);
  }, [pathname, router, initialSortField, initialSortDirection]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    lastFetchParamsRef.current = null;
    setTimeout(() => {
      fetchEmployees();
    }, 100);
  }, [fetchEmployees]);

  return {
    employees,
    loading: isLoading,
    error: apiError,
    totalPages,
    totalItems,
    currentPage,
    setCurrentPage: handlePageChange,
    searchQuery: searchInput,
    onSearchChange: handleSearchChange,
    selectedRole,
    onRoleChange: handleRoleChange,
    selectedOutlet,
    onOutletChange: handleOutletChange,
    sortBy,
    setSortBy: handleSortChange,
    onResetFilters: resetFilters,
    refresh,
  };
}
