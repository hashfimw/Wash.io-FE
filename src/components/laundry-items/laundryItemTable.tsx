import { useState } from "react";
import { OrderItem } from "@/types/order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertCircle, Edit, MoreHorizontal, Trash } from "lucide-react";

import { format } from "date-fns";
import { EditItemDialog } from "./editItemDialog";
import { DeleteItemDialog } from "./deleteItemDialog";
import SwipeIndicator from "../swipeIndicator";

interface LaundryItemTableProps {
  items: OrderItem[];
  isSuperAdmin: boolean;
  onUpdate: (id: number, itemName: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function LaundryItemTable({ items, isSuperAdmin, onUpdate, onDelete }: LaundryItemTableProps) {
  const [editItem, setEditItem] = useState<OrderItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<OrderItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEditClick = (item: OrderItem) => {
    setEditItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (item: OrderItem) => {
    setDeleteItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateSubmit = async (itemName: string) => {
    if (editItem) {
      await onUpdate(editItem.id, itemName);
      setIsEditDialogOpen(false);
      setEditItem(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteItem) {
      await onDelete(deleteItem.id);
      setIsDeleteDialogOpen(false);
      setDeleteItem(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 rounded-full bg-blue-50 p-3">
          <AlertCircle className="h-6 w-6 text-blue-500" />
        </div>
        <h3 className="mb-2 text-xl font-medium">No Laundry Items Found</h3>
        <p className="text-center text-muted-foreground">
          There are no laundry items available yet.
          {isSuperAdmin && " Create one to get started."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <SwipeIndicator className="md:hidden" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.orderItemName}</TableCell>
                <TableCell>{format(new Date(item.createdAt), "dd MMM yyyy HH:mm")}</TableCell>
                <TableCell>{format(new Date(item.updatedAt), "dd MMM yyyy HH:mm")}</TableCell>
                {isSuperAdmin && item.id > 0 && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClick(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Item
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editItem && (
        <EditItemDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          item={editItem}
          onSubmit={handleUpdateSubmit}
        />
      )}

      {deleteItem && (
        <DeleteItemDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          item={deleteItem}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}
