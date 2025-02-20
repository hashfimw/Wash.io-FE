// src/hooks/api/outlets/useOutletTable.ts
import { useEffect, useState } from "react";
import { useOutlets } from "./useOutlets";
import { Outlet, OutletSortField, SortConfig } from "@/types/outlet";

interface UseOutletTableProps {
  pageSize?: number;
}

export function useOutletTable({ pageSize = 10 }: UseOutletTableProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortConfig>({
    field: "outletName",
    direction: "asc",
  });

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const { loading, error, getOutlets } = useOutlets();

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const response = await getOutlets();
        setOutlets(response.data);
      } catch (error) {
        console.error("Error fetching outlets:", error);
      }
    };

    fetchOutlets();
  }, []);

  const filteredOutlets = outlets.filter(
    (outlet) =>
      outlet.outletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outlet.outletAddress.addressLine
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const sortedOutlets = [...filteredOutlets].sort((a, b) => {
    let aValue: string;
    let bValue: string;

    // Menentukan nilai yang akan dibandingkan berdasarkan field sorting
    switch (sortBy.field) {
      case "outletName":
        aValue = a.outletName;
        bValue = b.outletName;
        break;
      case "addressLine":
        aValue = a.outletAddress.addressLine;
        bValue = b.outletAddress.addressLine;
        break;
      case "province":
        aValue = a.outletAddress.province;
        bValue = b.outletAddress.province;
        break;
      case "district":
        aValue = a.outletAddress.district;
        bValue = b.outletAddress.district;
        break;
      case "regency":
        aValue = a.outletAddress.regency;
        bValue = b.outletAddress.regency;
        break;
      case "village":
        aValue = a.outletAddress.village;
        bValue = b.outletAddress.village;
        break;
      default:
        aValue = a.outletName;
        bValue = b.outletName;
    }

    return sortBy.direction === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const totalPages = Math.ceil(sortedOutlets.length / pageSize);
  const paginatedOutlets = sortedOutlets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearchQuery("");
    setCurrentPage(1);
    setSortBy({ field: "outletName", direction: "asc" });
  };

  return {
    outlets: paginatedOutlets,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    sortBy,
    setSortBy,
    resetFilters,
  };
}
