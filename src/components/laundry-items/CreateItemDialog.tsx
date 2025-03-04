// src/components/laundry-item/CreateItemDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { OrderItem } from "@/types/order";

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (itemName: string) => Promise<void>;
  items: OrderItem[]; // Add items prop for validation
}

export function CreateItemDialog({
  open,
  onOpenChange,
  onSubmit,
  items,
}: CreateItemDialogProps) {
  const [itemName, setItemName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!itemName.trim()) {
      setError("Item name is required");
      return;
    }

    // Check if an item with this name already exists
    const existingItem = items.find(
      (item) => item.orderItemName.toLowerCase() === itemName.toLowerCase()
    );

    if (existingItem) {
      setError("An item with this name already exists");
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "An item with this name already exists.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onSubmit(itemName);
      setItemName("");
      toast({
        title: "Success",
        description: "Laundry item created successfully.",
      });
    } catch (err: string | any) {
      // Check if error is due to duplicate item
      if (err.response?.data?.message?.includes("already exists")) {
        setError("An item with this name already exists");
        toast({
          variant: "destructive",
          title: "Error",
          description: "An item with this name already exists.",
        });
      } else {
        setError(
          "An error occurred while creating the item. Please try again."
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create laundry item. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setItemName("");
      setError("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95%] max-w-md mx-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg sm:text-xl">
              Create New Laundry Item
            </DialogTitle>
            <DialogDescription className="text-sm">
              Add a new laundry item that can be selected in orders.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-1 sm:gap-4">
              <Label
                htmlFor="itemName"
                className="sm:text-right text-sm sm:text-base mb-1 sm:mb-0"
              >
                Item Name
              </Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="col-span-1 sm:col-span-3"
                placeholder="e.g., T-Shirt, Jeans, Bedsheet"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-xs sm:text-sm text-red-500 col-span-1 sm:col-span-4 text-left sm:text-right">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-2 sm:mt-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="birtu"
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
