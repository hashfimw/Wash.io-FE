// src/hooks/useOrderItems.ts
import { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { ProcessOrderFormValues } from "@/components/orders/process-order/ProcessOrderForm";

export function useOrderItems(form: UseFormReturn<ProcessOrderFormValues>) {
  const [inputType, setInputType] = useState<"select" | "custom">("select");

  // Use fieldArray to properly manage dynamic fields
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orderItems",
  });

  // Check for duplicate items
  const isDuplicateItem = (itemName: string, currentIndex: number) => {
    const items = form.getValues("orderItems");
    return items.some(
      (item, index) =>
        index !== currentIndex &&
        item.orderItemName.toLowerCase() === itemName.toLowerCase()
    );
  };

  // Add new item row
  const addItem = () => {
    append({ orderItemName: "", qty: 1 });
  };

  // Remove item row
  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Validate item before adding
  const validateItemName = (value: string, index: number) => {
    if (!value) return "Item name is required";
    if (isDuplicateItem(value, index)) return "This item is already added";
    return true;
  };

  // Handle item selection change
  const handleItemChange = (value: string, index: number) => {
    if (value && isDuplicateItem(value, index)) {
      toast({
        title: "Duplicate Item",
        description: "This item is already added to the order",
        variant: "destructive",
      });
      return;
    }
    form.setValue(`orderItems.${index}.orderItemName`, value);
  };

  // Handle input change
  const handleInputChange = (value: string, index: number) => {
    if (isDuplicateItem(value, index)) {
      form.setError(`orderItems.${index}.orderItemName`, {
        type: "manual",
        message: "This item is already added",
      });
    } else {
      form.clearErrors(`orderItems.${index}.orderItemName`);
    }
    form.setValue(`orderItems.${index}.orderItemName`, value);
  };

  return {
    fields,
    inputType,
    setInputType,
    isDuplicateItem,
    addItem,
    removeItem,
    validateItemName,
    handleItemChange,
    handleInputChange,
  };
}
