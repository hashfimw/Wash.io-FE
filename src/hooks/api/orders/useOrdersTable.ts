import { useState, useEffect, useCallback, useRef } from "react";
import { useOrders } from "./useOrders";
import { Order, OrderResponse, OrderStatus } from "@/types/order";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface UseOrderTableProps {
  pageSize?: number;
}

export function useOrderTable({ pageSize = 10 }: UseOrderTableProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMounted = useRef(false);
  const pendingUpdateRef = useRef(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
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

  const { getAllOrders, loading, error } = useOrders();

  const lastParamsRef = useRef<string | null>(null);

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

  const fetchOrders = useCallback(async () => {
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

    if (lastParamsRef.current === paramsKey && orders.length > 0) {
      console.log("Using cached order data");
      return;
    }

    lastParamsRef.current = paramsKey;

    try {
      console.log("Fetching orders with params:", params);

      const response = await getAllOrders(params);

      if (isMounted.current) {
        setOrders(
          response.data.data.map((order: OrderResponse) => ({
            id: order.id,
            status: order.status,
          })) || []
        );
        setTotalPages(response.data.meta?.total_page || 1);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [currentPage, pageSize, status, selectedOutlet, dateRange, sortOrder, getAllOrders, orders.length]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = useCallback((newStatus: OrderStatus | "") => {
    setStatus(newStatus);
    setCurrentPage(1);
  }, []);

  const handleDateRangeChange = useCallback((range: { startDate: Date; endDate: Date } | null) => {
    if (!range) {
      setDateRange({ startDate: null, endDate: null });
    } else {
      setDateRange({
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
      });
    }
    setCurrentPage(1);
  }, []);

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

    if (isMounted.current) {
      router.push(pathname);
    }

    lastParamsRef.current = null;
  }, [pathname, router]);

  const refresh = useCallback(() => {
    lastParamsRef.current = null;
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
