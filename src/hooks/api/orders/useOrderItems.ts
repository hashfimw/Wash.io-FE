import { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { ProcessOrderFormValues } from "@/components/orders/process-order/ProcessOrderForm";

export function useOrderItems(form: UseFormReturn<ProcessOrderFormValues>) {
  const [inputType, setInputType] = useState<"select" | "custom">("select");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orderItems",
  });

  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .trim() // Hilangkan spasi di awal dan akhir
      .replace(/\s+/g, " ") // Hilangkan multiple spaces
      .replace(/[^a-z0-9\s]/g, ""); // Hilangkan karakter khusus
  };

  const isDuplicateItem = (itemName: string, currentIndex: number) => {
    if (!itemName) return false;

    const normalizedNewItem = normalizeString(itemName);
    const items = form.getValues("orderItems");

    return items.some(
      (item, index) => index !== currentIndex && normalizeString(item.orderItemName) === normalizedNewItem
    );
  };

  const addItem = () => {
    append({ orderItemName: "", qty: undefined as unknown as number });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const validateItemName = (value: string, index: number) => {
    if (!value) return "Item name is required";
    if (isDuplicateItem(value, index)) return "This item is already added";
    return true;
  };

  const handleItemChange = (value: string, index: number) => {
    if (value && isDuplicateItem(value, index)) {
      toast({
        title: "Duplicate Item",
        description: "This item has already been added to the order",
        variant: "destructive",
      });
      return;
    }
    form.setValue(`orderItems.${index}.orderItemName`, value);
  };

  const handleInputChange = (value: string, index: number) => {
    const normalizedValue = value.trim();

    if (isDuplicateItem(normalizedValue, index)) {
      form.setError(`orderItems.${index}.orderItemName`, {
        type: "manual",
        message: "This item has already been added",
      });
    } else {
      form.clearErrors(`orderItems.${index}.orderItemName`);
    }
    form.setValue(`orderItems.${index}.orderItemName`, normalizedValue);
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
