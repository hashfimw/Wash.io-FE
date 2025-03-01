// src/app/(dashboard)/super-admin/outlets/page.tsx
"use client";

import { useEffect, useState } from "react";
import { OutletForm } from "@/components/outlets/outlet-form/outlet-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OutletTable } from "@/components/outlets/outletTable";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

export default function OutletsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<any>(null);
  const { setBreadcrumbItems } = useBreadcrumb();

  const handleEdit = (outlet: any) => {
    setSelectedOutlet(outlet);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setSelectedOutlet(null);
  };

  const handleSuccess = () => {
    // Refresh table data
    handleClose();
  };

  useEffect(() => {
    setBreadcrumbItems([
      { label: "Super Admin", href: "/super-admin/dashboard" },
      { label: "Outlets" },
    ]);
  }, [setBreadcrumbItems]);

  return (
    <div className="container mx-auto px-4 py-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            Manage Outlets
          </h1>
          <p className="text-sm text-muted-foreground mt-1 sm:hidden">
            Add, edit and manage all your laundry outlets
          </p>
        </div>
        <div className="w-full sm:w-auto mt-2 sm:mt-0">
          <Button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto"
            variant="oren"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Outlet
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-2 sm:p-6">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <OutletTable onEdit={handleEdit} />
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <OutletForm
        open={isFormOpen}
        onClose={handleClose}
        outlet={selectedOutlet}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
