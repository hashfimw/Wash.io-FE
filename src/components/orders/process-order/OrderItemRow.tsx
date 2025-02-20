// src/components/orders/OrderItemRow.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Control } from "react-hook-form";
import { OrderItem } from "@/types/order";
import { ProcessOrderFormValues } from "./ProcessOrderForm";

interface OrderItemRowProps {
  index: number;
  control: Control<ProcessOrderFormValues>;
  templates: OrderItem[];
  canRemove: boolean;
  onRemove: () => void;
  onSelectChange: (value: string) => void;
  onInputChange: (value: string) => void;
}

export function OrderItemRow({
  index,
  control,
  templates,
  canRemove,
  onRemove,
  onSelectChange,
  onInputChange,
}: OrderItemRowProps) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex-1">
        <FormField
          control={control}
          name={`orderItems.${index}.orderItemName`}
          render={({ field }) => (
            <FormItem>
              <Tabs defaultValue="select" className="w-full">
                <TabsList className="mb-2">
                  <TabsTrigger value="select">Select Existing</TabsTrigger>
                  <TabsTrigger value="custom">Add New</TabsTrigger>
                </TabsList>

                <TabsContent value="select">
                  <FormControl>
                    <Select
                      onValueChange={(value) => onSelectChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem
                            key={template.id}
                            value={template.orderItemName}
                          >
                            {template.orderItemName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </TabsContent>

                <TabsContent value="custom">
                  <FormControl>
                    <Input
                      placeholder="Enter new item name"
                      {...field}
                      onChange={(e) => onInputChange(e.target.value)}
                    />
                  </FormControl>
                </TabsContent>
              </Tabs>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="w-24 pt-12 mt-1">
        {" "}
        {/* Tambahkan padding-top untuk menyejajarkan dengan select item */}
        <FormField
          control={control}
          name={`orderItems.${index}.qty`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Qty"
                  min={1}
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 1)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="pt-12 mt-1">
        {" "}
        {/* Tambahkan padding-top untuk menyejajarkan dengan button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
