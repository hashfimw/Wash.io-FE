"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useLaundryItems } from "@/hooks/api/laundry-item/useLaundryItems";
import { OrderItem } from "@/types/order";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { LaundryItemHeader } from "@/components/laundry-items/laundryItemHeader";
import { LaundryItemTable } from "@/components/laundry-items/laundryItemTable";
import { CreateItemDialog } from "@/components/laundry-items/CreateItemDialog";

export default function LaundryItemPage() {
  const params = useParams();
  const role = Array.isArray(params.role) ? params.role[0] : params.role || "outlet-admin";
  const isSuperAdmin = role === "super-admin";
  const { setBreadcrumbItems } = useBreadcrumb();
  const { toast } = useToast();
  const { getLaundryItems, createLaundryItem, updateLaundryItem, deleteLaundryItem, error } =
    useLaundryItems();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<OrderItem[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([{ label: roleName, href: `/dashboard/${role}` }, { label: "Laundry Items" }]);
  }, [role, setBreadcrumbItems]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await getLaundryItems();
        if (response && response.data) {
          const validItems = Array.isArray(response.data) ? response.data : [];
          setItems(validItems);
          setFilteredItems(validItems);
        }
      } catch (err) {
        console.error("Error fetching laundry items:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load laundry items. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [refetchTrigger]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = items.filter((item) => item.orderItemName.toLowerCase().includes(lowerQuery));
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  const handleCreateItem = async (itemName: string) => {
    try {
      const response = await createLaundryItem(itemName);
      if (response && response.data) {
        setIsCreateDialogOpen(false);

        setRefetchTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error creating laundry item:", err);
    }
  };

  const handleUpdateItem = async (id: number, itemName: string) => {
    try {
      const response = await updateLaundryItem(id, itemName);
      if (response && response.data) {
        setItems((prev) => prev.map((item) => (item.id === id ? response.data : item)));
        toast({
          title: "Success",
          description: "Laundry item updated successfully.",
        });
      }
    } catch (err) {
      console.error("Error updating laundry item:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update laundry item. Please try again.",
      });
      setRefetchTrigger((prev) => prev + 1);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteLaundryItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Success",
        description: "Laundry item deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting laundry item:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete laundry item. Please try again.",
      });
      setRefetchTrigger((prev) => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Laundry Items</h1>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <LaundryItemHeader
        isSuperAdmin={isSuperAdmin}
        onCreateClick={() => setIsCreateDialogOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <Card>
        <CardHeader>
          <CardTitle>Laundry Items List</CardTitle>
          <CardDescription>
            {isSuperAdmin
              ? "Manage laundry items that can be used in orders"
              : "View available laundry items for orders"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LaundryItemTable
            items={filteredItems}
            isSuperAdmin={isSuperAdmin}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
          />
        </CardContent>
      </Card>

      <CreateItemDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateItem}
        items={items} // Pass items for duplicate checking
      />
    </div>
  );
}
