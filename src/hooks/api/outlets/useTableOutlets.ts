// src/hooks/api/outlets/useTableOutlets.ts
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

export function useOutletTable({
  pageSize = 10,
  initialData,
}: UseOutletTableProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Cek apakah komponen sudah di-mount
  const isMounted = useRef(false);
  // Simpan apakah initial data sudah digunakan
  const initialDataUsed = useRef(false);
  // Mencegah update URL berlebihan
  const pendingUpdateRef = useRef(false);

  // States
  const [outlets, setOutlets] = useState<Outlet[]>(initialData?.outlets || []);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 0);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [sortBy, setSortBy] = useState<SortConfig>({
    field: (searchParams.get("sortBy") as OutletSortField) || "province",
    direction: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
  });
  const [loading, setLoading] = useState(!initialData); // Jika ada initialData, tidak perlu loading awal
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { getOutlets } = useOutlets();
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Cache untuk mencegah fetch berulang dengan params yang sama
  const lastParamsRef = useRef<string | null>(null);

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

  // Fetch outlets dengan optimasi cache
  const fetchOutlets = useCallback(async () => {
    // Jika ada initial data dan belum pernah digunakan, gunakan itu
    if (initialData && !initialDataUsed.current) {
      initialDataUsed.current = true;
      setOutlets(initialData.outlets);
      setTotalPages(initialData.totalPages);
      setLoading(false);
      return;
    }

    // Buat params key untuk cache
    const paramsKey = JSON.stringify({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch,
      sortBy: sortBy.field,
      sortList: sortBy.direction,
    });

    // Jika params sama dengan request terakhir, skip request
    if (lastParamsRef.current === paramsKey && outlets.length > 0) {
      return;
    }

    try {
      setLoading(true);
      lastParamsRef.current = paramsKey;

      const response = await getOutlets({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        sortBy: sortBy.field,
        sortList: sortBy.direction,
      });

      // Update state hanya jika component masih mounted
      if (isMounted.current) {
        setOutlets(response.data || []);
        if (response.meta) {
          setTotalPages(response.meta.total);
        }
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching outlets:", err);
      if (isMounted.current) {
        setError("Failed to fetch outlets");
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
  ]);

  // Effect untuk menandai component mounted
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Effect untuk update URL saat parameter berubah
  useEffect(() => {
    // Skip initial URL update jika ada initialData
    if (initialData && !initialDataUsed.current) {
      return;
    }

    updateUrl({
      page: currentPage.toString(),
      search: debouncedSearch || null,
      sortBy: sortBy.field,
      sortList: sortBy.direction,
    });
  }, [currentPage, debouncedSearch, sortBy, updateUrl, initialData]);

  // Effect untuk fetch data saat parameters berubah
  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  // Optimized handlers dengan useCallback
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset ke halaman pertama saat searching
  }, []);

  const handleSortChange = useCallback((field: OutletSortField) => {
    setSortBy((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1); // Reset ke halaman pertama saat sort berubah
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
    setSortBy({ field: "outletName", direction: "asc" });

    // Reset URL params
    if (isMounted.current) {
      router.push(pathname);
    }

    // Invalidate cache untuk memaksa fetch baru
    lastParamsRef.current = null;
  }, [pathname, router]);

  return {
    outlets,
    loading,
    error,
    searchQuery,
    onSearchChange: handleSearchChange,
    currentPage,
    setCurrentPage,
    totalPages,
    sortBy,
    onSortChange: handleSortChange,
    resetFilters,
    refresh: useCallback(() => {
      // Invalidate cache untuk memaksa fetch baru
      lastParamsRef.current = null;
      fetchOutlets();
    }, [fetchOutlets]),
  };
}
