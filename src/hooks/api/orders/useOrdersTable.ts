// src/hooks/api/orders/useOrderTable.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useOrders } from "./useOrders";
import { Order, OrderResponse, OrderStatus } from "@/types/order";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface OrderTableParams {
  orderStatus?: OrderStatus;
  outletId?: number | null;
  startDate?: string;
  endDate?: string;
  sortOrder?: string;
}

interface UseOrderTableProps {
  pageSize?: number;
}

export function useOrderTable({ pageSize = 10 }: UseOrderTableProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Cek apakah komponen sudah di-mount
  const isMounted = useRef(false);
  // Mencegah update URL berlebihan
  const pendingUpdateRef = useRef(false);

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  // Filter states
  const [status, setStatus] = useState<OrderStatus | "">(
    (searchParams.get("status") as OrderStatus | "") || ""
  );
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: searchParams.get("startDate"),
    endDate: searchParams.get("endDate"),
  });
  const [selectedOutlet, setSelectedOutlet] = useState<number | null>(
    searchParams.get("outletId") ? Number(searchParams.get("outletId")) : null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sort") as "asc" | "desc") || "asc"
  );

  // Hooks
  const { getAllOrders, loading, error } = useOrders();

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

          // Daftar semua kemungkinan parameter
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

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
    // Buat params key untuk tracking
    const params = {
      page: currentPage,
      limit: pageSize,
      orderStatus: status || undefined,
      outletId: selectedOutlet || undefined,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
      sortOrder: sortOrder as "asc" | "desc",
    };

    const paramsKey = JSON.stringify(params);

    // Skip jika params sama dan kita sudah punya data
    if (lastParamsRef.current === paramsKey && orders.length > 0) {
      console.log("Using cached order data");
      return;
    }

    lastParamsRef.current = paramsKey;

    try {
      console.log("Fetching orders with params:", params);

      const response = await getAllOrders(params);

      if (isMounted.current) {
        // Pastikan data sesuai format yang diharapkan
        setOrders(
          response.data.data.map((order: OrderResponse) => ({
            id: order.id,
            status: order.status,
            // map other fields accordingly
          })) || []
        );
        setTotalPages(response.data.meta?.total_page || 1);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [
    currentPage,
    pageSize,
    status,
    selectedOutlet,
    dateRange,
    sortOrder,
    getAllOrders,
    orders.length,
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
    updateUrl({
      page: currentPage.toString(),
      status: status || null,
      outletId: selectedOutlet?.toString() || null,
      startDate: dateRange.startDate || null,
      endDate: dateRange.endDate || null,
      sort: sortOrder || null,
    });
  }, [currentPage, status, selectedOutlet, dateRange, sortOrder, updateUrl]);

  // Effect untuk fetch data saat URL parameter berubah
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handlers for filter changes
  const handleStatusChange = useCallback((newStatus: OrderStatus | "") => {
    setStatus(newStatus);
    setCurrentPage(1); // Reset to page 1 when filter changes
  }, []);

  const handleDateRangeChange = useCallback(
    (range: { startDate: Date; endDate: Date } | null) => {
      if (!range) {
        setDateRange({ startDate: null, endDate: null });
      } else {
        setDateRange({
          startDate: range.startDate.toISOString(),
          endDate: range.endDate.toISOString(),
        });
      }
      setCurrentPage(1);
    },
    []
  );

  const handleOutletChange = useCallback((outletId: number | null) => {
    setSelectedOutlet(outletId);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resetFilters = useCallback(() => {
    setStatus("");
    setDateRange({ startDate: null, endDate: null });
    setSelectedOutlet(null);
    setCurrentPage(1);
    setSortOrder("asc");

    // Reset URL params
    if (isMounted.current) {
      router.push(pathname);
    }

    // Invalidate cache untuk memaksa fetch baru
    lastParamsRef.current = null;
  }, [pathname, router]);

  const refresh = useCallback(() => {
    lastParamsRef.current = null; // Invalidate params cache
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    currentPage,
    totalPages,
    status,
    dateRange,
    selectedOutlet,
    sortOrder,
    handleStatusChange,
    handleDateRangeChange,
    handleOutletChange,
    handlePageChange,
    resetFilters,
    refresh,
  };
}
