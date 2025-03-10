"use client";

import { useEffect, useState, useCallback } from "react";

import { OrderFilters } from "@/components/orders/OrderFilters";
import { useOrders } from "@/hooks/api/orders/useOrders";
import { Order, OrderStatus, OrderTrackingResponse } from "@/types/order";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { OrderTrackingDialog } from "@/components/orders/order-tracking/OrderTrackigDialog";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import { endOfDay, startOfDay } from "date-fns";
import { OrderTable } from "@/components/orders/OrderTable";

export default function OrdersPage() {
  const params = useParams();
  const role = params.role as string;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(() =>
    searchParams.get("outletId") ? Number(searchParams.get("outletId")) : null
  );
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">(
    () => (searchParams.get("status") as OrderStatus | "") || ""
  );
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [trackingData, setTrackingData] = useState<OrderTrackingResponse | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate && endDate) {
      return {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }

    return null;
  });
  const [localLoading, setLocalLoading] = useState(true);
  const { getAllOrders, trackOrder, loading: apiLoading_, error } = useOrders();
  const { setBreadcrumbItems } = useBreadcrumb();

  const updateUrl = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const fetchOrders = async () => {
      setLocalLoading(true);
      try {
        const requestParams: Record<string, unknown> = {
          outletId: selectedOutletId || undefined,
          orderStatus: selectedStatus || undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: 10,
          sortOrder: "desc",
        };
        if (dateRange) {
          requestParams.startDate = startOfDay(dateRange.startDate).toISOString();
          requestParams.endDate = endOfDay(dateRange.endDate).toISOString();
        }
        const response = await getAllOrders(requestParams);

        if (response.data && Array.isArray(response.data.data)) {
          setOrders(response.data.data);
          setTotalPages(response.data.meta.total);
        } else {
          setOrders([]);
          console.error("Invalid orders data structure:", response);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchOrders();
  }, [selectedOutletId, selectedStatus, searchQuery, dateRange, currentPage, getAllOrders]);

  useEffect(() => {
    const urlParams: Record<string, string | null> = {
      page: currentPage.toString(),
      status: selectedStatus || null,
      outletId: selectedOutletId?.toString() || null,
      search: searchQuery || null,
    };

    if (dateRange) {
      urlParams.startDate = dateRange.startDate.toISOString();
      urlParams.endDate = dateRange.endDate.toISOString();
    }

    updateUrl(urlParams);
  }, [currentPage, selectedStatus, selectedOutletId, searchQuery, dateRange, updateUrl]);

  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([{ label: roleName, href: `/dashboard/${role}` }, { label: "Orders" }]);
  }, [setBreadcrumbItems, role]);

  const handleOutletChange = (outletId: number | null) => {
    setSelectedOutletId(outletId);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: OrderStatus | "") => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date } | null) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTrackOrder = async (orderId: number) => {
    try {
      const response = await trackOrder(orderId);
      setTrackingData(response.data.data);
      setIsTrackingOpen(true);
    } catch (error) {
      console.error("Error tracking order:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">All Orders and Tracking Orders</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <OrderFilters
              onStatusChange={handleStatusChange}
              onOutletChange={handleOutletChange}
              onDateRangeChange={handleDateRangeChange}
              onSearch={handleSearch}
            />
          </div>

          <OrderTable
            orders={orders}
            loading={localLoading || apiLoading_}
            error={error}
            isAdmin={role === "super-admin"}
            onTrackOrder={handleTrackOrder}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <OrderTrackingDialog
        open={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          setTrackingData(null);
        }}
        tracking={trackingData}
      />
    </div>
  );
}
