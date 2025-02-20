"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { OutletTableFilters } from "./outlet-table-filters";
import { OutletTablePagination } from "./outlet-table-pagination";
import { OutletDeleteAlert } from "./outlet-delete-alert";
import { useToast } from "@/components/ui/use-toast";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { useOutletTable } from "@/hooks/api/outlets/useTableOutlets";
import { Outlet } from "@/types/outlet";

interface OutletTableProps {
  onEdit: (outlet: Outlet) => void;
}

export function OutletTable({ onEdit }: OutletTableProps) {
  const { toast } = useToast();
  const { deleteOutlet } = useOutlets();
  const [deleteOutletId, setDeleteOutletId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    outlets,
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
  } = useOutletTable();

  const handleDelete = async () => {
    if (!deleteOutletId) return;

    try {
      setDeleteLoading(true);
      await deleteOutlet(deleteOutletId);
      toast({
        title: "Success",
        description: "Outlet deleted successfully",
      });
      setDeleteOutletId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete outlet",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <TableSkeleton columns={5} rows={5} />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-4">
      {/* Filters section */}
      <div className="w-full">
        <OutletTableFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onResetFilters={resetFilters}
        />
      </div>

      {/* Table section dengan scroll horizontal */}
      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer whitespace-nowrap min-w-[150px]"
                onClick={() =>
                  setSortBy({
                    field: "outletName",
                    direction:
                      sortBy.field === "outletName" &&
                      sortBy.direction === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Outlet Name{" "}
                {sortBy.field === "outletName" &&
                  (sortBy.direction === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="whitespace-nowrap min-w-[200px]">
                Address
              </TableHead>
              <TableHead className="whitespace-nowrap min-w-[120px]">
                Province
              </TableHead>
              <TableHead className="whitespace-nowrap min-w-[120px]">
                District
              </TableHead>
              <TableHead className="text-right whitespace-nowrap min-w-[100px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outlets.map((outlet: Outlet) => (
              <TableRow key={outlet.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {outlet.outletName}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {outlet.outletAddress.addressLine}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {outlet.outletAddress.province}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {outlet.outletAddress.district}
                </TableCell>
                <TableCell className="text-right p-2">
                  <div className="flex justify-end gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(outlet)}
                    >
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination dengan proper spacing */}
      <div className="flex justify-center sm:justify-end mt-4">
        <OutletTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
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
