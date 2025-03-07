"use client";

import { useEffect, useState } from "react";
import { OutletForm } from "@/components/outlets/outlet-form/outlet-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OutletTable } from "@/components/outlets/outletTable";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { Outlet } from "@/types/outlet";

export default function OutletsClient() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | undefined>(
    undefined
  );
  const { setBreadcrumbItems } = useBreadcrumb();

  const handleEdit = (outlet: Outlet) => {
    setSelectedOutlet(outlet);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setSelectedOutlet(undefined);
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
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            Manage Outlets
          </h1>
        </div>
        <div className="w-full sm:w-auto">
          <Button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto"
            variant={"oren"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Outlet
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 sm:p-6">
          <OutletTable onEdit={handleEdit} />
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
