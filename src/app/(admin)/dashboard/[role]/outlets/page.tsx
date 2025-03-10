"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { OutletForm } from "@/components/outlets/outlet-form/outlet-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OutletTable } from "@/components/outlets/outletTable";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { Outlet } from "@/types/outlet";

interface PageProps {
  initialData?: {
    outlets: Outlet[];
    totalPages: number;
  };
}

export default function OutletsPage({ initialData }: PageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | undefined>(undefined);
  const { setBreadcrumbItems } = useBreadcrumb();
  const refreshFnRef = useRef<(() => void) | null>(null);

  // Setup breadcrumb
  useEffect(() => {
    setBreadcrumbItems([{ label: "Super Admin", href: "/super-admin/dashboard" }, { label: "Outlets" }]);
  }, [setBreadcrumbItems]);

  // Handler for editing an outlet
  const handleEdit = useCallback((outlet: Outlet) => {
    setSelectedOutlet(outlet);
    setIsFormOpen(true);
  }, []);

  // Handler for closing the form
  const handleClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedOutlet(undefined);
  }, []);

  // Handler for form submission success with forced refresh
  const handleSuccess = useCallback(() => {
    // Force an immediate refresh of the table data
    if (refreshFnRef.current) {
      // Short delay to ensure backend operations complete
      setTimeout(() => {
        if (refreshFnRef.current) {
          refreshFnRef.current();
        }
      }, 300);
    }
  }, []);

  // Store the refresh function in a ref to ensure it doesn't change
  const handleRefreshReady = useCallback((refresh: () => void) => {
    refreshFnRef.current = refresh;
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">Manage Outlets</h1>
        </div>
        <div className="w-full sm:w-auto flex gap-2">
          <Button
            onClick={() => {
              setSelectedOutlet(undefined);
              setIsFormOpen(true);
            }}
            className="w-full sm:w-auto"
            variant="oren"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Outlet
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 sm:p-6">
          <OutletTable onEdit={handleEdit} onRefreshReady={handleRefreshReady} initialData={initialData} />
        </div>
      </div>

      {/* Modal Form */}
      <OutletForm open={isFormOpen} onClose={handleClose} outlet={selectedOutlet} onSuccess={handleSuccess} />
    </div>
  );
}
