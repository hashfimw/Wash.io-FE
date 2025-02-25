// src/hooks/api/outlets/useOutletTable.ts
import { useEffect, useState } from "react";
import { useOutlets } from "./useOutlets";
import { Outlet, OutletSortField, SortConfig } from "@/types/outlet";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface UseOutletTableProps {
  pageSize?: number;
}
export function useOutletTable({ pageSize = 10 }: UseOutletTableProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // States
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [sortBy, setSortBy] = useState<SortConfig>({
    field: (searchParams.get("sortBy") as OutletSortField) || "outletName",
    direction: (searchParams.get("sortBy") as "asc" | "desc") || "asc",
  });

  // Hooks
  const { loading, error, getOutlets } = useOutlets();
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Update URL dengan parameter baru
  const updateUrl = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  // Fetch data
  // src/hooks/api/outlets/useOutletTable.ts
  const fetchOutlets = async () => {
    try {
      const response = await getOutlets({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        sortBy: sortBy.field,
        sortList: sortBy.direction,
      });

      setOutlets(response.data);

      // Set total pages dari response.meta.total
      if (response.meta) {
        setTotalPages(response.meta.total);
      }
    } catch (error) {
      console.error("Error fetching outlets:", error);
    }
  };

  // Effect untuk update URL saat parameter berubah
  useEffect(() => {
    updateUrl({
      page: currentPage.toString(),
      search: debouncedSearch || null,
      sortBy: sortBy.field,
      sortOrder: sortBy.direction,
    });
  }, [currentPage, debouncedSearch, sortBy]);

  // Effect untuk fetch data saat URL berubah
  useEffect(() => {
    fetchOutlets();
  }, [searchParams]);

  useEffect(() => {
    // Cek jika ada query params
    if (searchParams.toString()) {
      // Bersihkan URL ke path awal
      router.push(pathname);
    }
  }, []);
  // Handler untuk search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Handler untuk sort
  const handleSortChange = (field: OutletSortField) => {
    setSortBy((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  // Reset semua filter
  const resetFilters = () => {
    setSearchQuery("");
    setCurrentPage(1);
    setSortBy({ field: "outletName", direction: "asc" });
    router.push(pathname);
  };

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
    refresh: fetchOutlets,
  };
}
