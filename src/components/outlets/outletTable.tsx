"use client";
import { useState, useCallback, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { OutletTableFilters } from "./outlet-table-filters";
import { TablePagination } from "../shared/usePagination";
import { OutletDeleteAlert } from "./outlet-delete-alert";
import { useToast } from "@/components/ui/use-toast";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { Outlet } from "@/types/outlet";
import { useOutletTable } from "@/hooks/api/outlets/useTableOutlets";
import SwipeIndicator from "../swipeIndicator";

interface OutletTableProps {
  onEdit: (outlet: Outlet) => void;
  initialData?: {
    outlets: Outlet[];
    totalPages: number;
  };
}

export function OutletTable({ onEdit, initialData }: OutletTableProps) {
  const { toast } = useToast();
  const { deleteOutlet } = useOutlets();
  const [deleteOutletId, setDeleteOutletId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Gunakan initialData dari server jika tersedia
  const {
    outlets,
    loading,
    error,
    searchQuery,
    onSearchChange,
    currentPage,
    setCurrentPage,
    totalPages,
    sortBy,
    onSortChange,
    resetFilters,
    refresh,
  } = useOutletTable({
    initialData, // Pass initialData ke custom hook
    pageSize: 10,
  });

  // Menggunakan useCallback untuk fungsi yang sering digunakan
  const handleDelete = useCallback(async () => {
    if (!deleteOutletId) return;

    try {
      setDeleteLoading(true);
      await deleteOutlet(deleteOutletId);
      toast({
        title: "Success",
        description: "Outlet deleted successfully",
      });
      setDeleteOutletId(null);
      refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete outlet",
        variant: "destructive",
      });
      console.log("Failed to delete outlet:", error);
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteOutletId, deleteOutlet, toast, refresh]);

  // Gunakan useMemo untuk memoize table rows agar mengurangi re-renders
  const tableRows = useMemo(() => {
    return (
      outlets?.map((outlet: Outlet) => (
        <TableRow key={outlet.id}>
          <TableCell className="font-medium whitespace-nowrap">{outlet.outletName}</TableCell>
          <TableCell className="max-w-[200px] truncate">{outlet.outletAddress?.addressLine}</TableCell>
          <TableCell className="whitespace-nowrap">{outlet.outletAddress?.province}</TableCell>
          <TableCell className="whitespace-nowrap">{outlet.outletAddress?.district}</TableCell>
          <TableCell className="text-right p-2">
            <div className="flex justify-end gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(outlet)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setDeleteOutletId(outlet.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )) || []
    );
  }, [outlets, onEdit]);

  if (loading && !initialData) return <TableSkeleton columns={5} rows={5} />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-4">
      {/* Filters section */}
      <div className="w-full">
        <OutletTableFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onResetFilters={resetFilters}
        />
      </div>

      <div className="overflow-auto rounded-md border">
        <SwipeIndicator className="md:hidden" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Outlet Name </TableHead>
              <TableHead className="cursor-pointer whitespace-nowrap min-w-[200px]">Address</TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap min-w-[120px]"
                onClick={() => onSortChange("province")}
              >
                Province {sortBy.field === "province" && (sortBy.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="cursor-pointer whitespace-nowrap min-w-[120px]">District</TableHead>
              <TableHead className="text-right whitespace-nowrap min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && outlets.length === 0 ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell className="whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <div className="h-8 w-8 rounded bg-gray-200 animate-pulse"></div>
                        <div className="h-8 w-8 rounded bg-gray-200 animate-pulse"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            ) : outlets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No outlets found
                </TableCell>
              </TableRow>
            ) : (
              tableRows
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination dengan proper spacing */}
      <div className="flex justify-center sm:justify-end mt-4">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      </div>

      <OutletDeleteAlert
        open={!!deleteOutletId}
        onClose={() => setDeleteOutletId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
