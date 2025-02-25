"use client";

import { useEffect, useState } from "react";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { useOrders } from "@/hooks/api/orders/useOrders";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { Order, OrderStatus, OrderTrackingResponse } from "@/types/order";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { OrderTrackingDialog } from "@/components/orders/order-tracking/OrderTrackigDialog";

export default function OutletAdminOrdersPage() {
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // State untuk filter
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackingData, setTrackingData] =
    useState<OrderTrackingResponse | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const { getAllOrders, trackOrder, loading, error } = useOrders();
  // const { outlets, getOutlets } = useOutlets();
  const { setBreadcrumbItems } = useBreadcrumb();

  // Fetch orders ketika filter atau halaman berubah
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getAllOrders({
          outletId: selectedOutletId || undefined,
          orderStatus: selectedStatus || undefined,
          search: searchQuery || undefined,
          startDate: dateRange?.startDate.toISOString(),
          endDate: dateRange?.endDate.toISOString(),
          page: currentPage,
          limit: 10,
          sortOrder: "desc",
        });

        if (response.data && Array.isArray(response.data.data)) {
          setOrders(response.data.data);
          // Set total pages dari meta
          setTotalPages(response.data.meta.total);
        } else {
          setOrders([]);
          console.error("Invalid orders data structure:", response);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [selectedOutletId, selectedStatus, searchQuery, dateRange, currentPage]);

  // Set breadcrumb
  useEffect(() => {
    setBreadcrumbItems([
      { label: "Super Admin", href: "/super-admin/dashboard" },
      { label: "Orders" },
    ]);
  }, [setBreadcrumbItems]);

  // Handlers untuk filter
  const handleOutletChange = (outletId: number | null) => {
    setSelectedOutletId(outletId);
    // Reset ke halaman pertama saat filter berubah
    setCurrentPage(1);
  };

  const handleStatusChange = (status: OrderStatus | "") => {
    setSelectedStatus(status);
    // Reset ke halaman pertama saat filter berubah
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Reset ke halaman pertama saat filter berubah
    setCurrentPage(1);
  };

  const handleDateRangeChange = (
    range: { startDate: Date; endDate: Date } | null
  ) => {
    setDateRange(range);
    // Reset ke halaman pertama saat filter berubah
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
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            My Outlet Orders
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 sm:p-6">
          {/* Filter section */}
          <div className="mb-6">
            <OrderFilters
              onStatusChange={handleStatusChange}
              onOutletChange={handleOutletChange}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>

          {/* Table section */}
          <OrderTable
            orders={orders}
            loading={loading}
            error={error}
            isAdmin={true}
            onTrackOrder={handleTrackOrder}
            // Tambahkan props pagination
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
        loading={loading}
      />
    </div>
  );
}
