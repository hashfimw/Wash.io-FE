import { useState, useEffect, useCallback, useRef } from "react";
import { useOutlets } from "./useOutlets";
import { Outlet, OutletSortField, SortConfig } from "@/types/outlet";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface UseOutletTableProps {
  pageSize?: number;
  initialData?: {
    outlets: Outlet[];
    totalPages: number;
  };
}

export function useOutletTable({ pageSize = 10, initialData }: UseOutletTableProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if component is mounted
  const isMounted = useRef(false);
  // Store if initial data has been used
  const initialDataUsed = useRef(false);
  // Prevent excessive URL updates
  const pendingUpdateRef = useRef(false);
  // Add a forceRefresh flag
  const forceRefreshRef = useRef(false);

  const [_isLoading, setIsLoading] = useState(true);
  const [outlets, setOutlets] = useState<Outlet[]>(initialData?.outlets || []);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [sortBy, setSortBy] = useState<SortConfig>({
    field: (searchParams.get("sortBy") as OutletSortField) || "province",
    direction: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
  });
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  // Add a refreshCounter to force re-fetches
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Hooks
  const { getOutlets } = useOutlets();
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Cache to prevent repeated fetches with same params
  const lastParamsRef = useRef<string | null>(null);
  // Add timestamp to track last refresh
  const lastRefreshTimeRef = useRef<number>(Date.now());

  // Update URL with new parameters - with batching
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

  // Fetch outlets with cache optimization
  const fetchOutlets = useCallback(async () => {
    // Use initial data if available and not used yet
    if (initialData && !initialDataUsed.current) {
      initialDataUsed.current = true;
      setOutlets(initialData.outlets);
      setTotalPages(initialData.totalPages);
      setLoading(false);
      return;
    }

    // Create params key for cache
    const paramsKey = JSON.stringify({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch,
      sortBy: sortBy.field,
      sortOrder: sortBy.direction,
      refreshCounter, // Include refreshCounter to make sure new fetches happen when refreshed
    });

    // Only skip if params are the same AND it's not a forced refresh AND it's been less than 10 seconds
    const timeSinceLastRefresh = Date.now() - lastRefreshTimeRef.current;
    if (
      lastParamsRef.current === paramsKey &&
      !forceRefreshRef.current &&
      outlets.length > 0 &&
      timeSinceLastRefresh < 10000 // 10 seconds cache - fixed from 1ms
    ) {
      console.log("Using cached data, time since last refresh:", timeSinceLastRefresh, "ms");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      lastParamsRef.current = paramsKey;
      lastRefreshTimeRef.current = Date.now();
      forceRefreshRef.current = false;

      console.log("Fetching outlets with params:", {
        page: currentPage,
        limit: pageSize,
        sortBy: sortBy.field,
        sortOrder: sortBy.direction,
        search: debouncedSearch,
        refreshCounter, // Log for debugging
      });

      const response = await getOutlets({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        sortBy: sortBy.field,
        sortList: sortBy.direction,
      });

      if (isMounted.current) {
        setOutlets(response.data || []);
        if (response.meta) {
          setTotalPages(response.meta.total);
          const estimatedItems = response.meta.total * pageSize;
          setTotalItems(estimatedItems);
        }
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching outlets:", err);
      if (isMounted.current) {
        setError("Failed to fetch outlets");
        setTotalPages(1);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    sortBy,
    getOutlets,
    initialData,
    outlets.length,
    refreshCounter,
  ]); // Add refreshCounter to dependencies

  // Effect to mark component as mounted
  useEffect(() => {
    isMounted.current = true;
    fetchOutlets();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Effect to update URL when parameters change
  useEffect(() => {
    if (initialData && !initialDataUsed.current) {
      return;
    }

    updateUrl({
      page: currentPage.toString(),
      search: debouncedSearch || null,
      sortBy: sortBy.field,
      sortOrder: sortBy.direction,
    });
  }, [currentPage, debouncedSearch, sortBy, updateUrl, initialData]);

  // Effect to fetch data when parameters change
  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  // Optimized handlers with useCallback
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((field: OutletSortField) => {
    setLoading(true);
    setSortBy((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      setLoading(true);
      setCurrentPage(page);
      updateUrl({ page: page.toString() });
    },
    [updateUrl]
  );

  const resetFilters = useCallback(() => {
    setLoading(true);
    setSearchQuery("");
    setCurrentPage(1);
    setSortBy({ field: "outletName", direction: "asc" });

    if (isMounted.current) {
      router.push(pathname);
    }

    lastParamsRef.current = null;
  }, [pathname, router]);

  // Improved refresh function to force new data fetch
  const refresh = useCallback(() => {
    setLoading(true);
    // Force refresh flag
    forceRefreshRef.current = true;
    // Reset cache params
    lastParamsRef.current = null;
    // Update refresh timestamp
    lastRefreshTimeRef.current = Date.now();
    // Increment refresh counter to force dependency change
    setRefreshCounter((prev) => prev + 1);

    // Fetch immediately, no need for timeout
    fetchOutlets();
  }, [fetchOutlets]);

  return {
    // Data
    outlets,
    loading,
    error,
    totalPages,
    totalItems,

    // Pagination
    currentPage,
    setCurrentPage: handlePageChange,

    // Search and filter
    searchQuery,
    onSearchChange: handleSearchChange,

    // Sorting
    sortBy,
    onSortChange: handleSortChange,

    // Actions
    resetFilters,
    refresh,
  };
}
