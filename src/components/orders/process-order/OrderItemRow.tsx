import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Control } from "react-hook-form";
import { OrderItem } from "@/types/order";
import { ProcessOrderFormValues } from "./ProcessOrderForm";
import { toast } from "@/components/ui/use-toast";

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
  const [selectedTab, setSelectedTab] = useState<"select" | "custom">("select");
  const isExistingTemplate = (value: string): boolean => {
    return templates.some(
      (template) => template.orderItemName.toLowerCase().trim() === value.toLowerCase().trim()
    );
  };

  const handleCustomInputChange = (value: string) => {
    if (isExistingTemplate(value)) {
      onInputChange(""); // Reset input
      toast({
        title: "Item already exists",
        description: "This item already exists in the template. Please select it from 'Select Existing'.",
        variant: "destructive",
      });
      setSelectedTab("select");
      return;
    }
    onInputChange(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="flex-1 w-full">
        <FormField
          control={control}
          name={`orderItems.${index}.orderItemName`}
          render={({ field }) => (
            <FormItem className="w-full">
              <Tabs
                value={selectedTab}
                onValueChange={(value) => {
                  setSelectedTab(value as "select" | "custom");
                  field.onChange("");
                }}
                className="w-full"
              >
                <TabsList className="mb-2 w-full sm:w-auto">
                  <TabsTrigger value="select" className="flex-1 text-xs sm:text-sm">
                    Select Existing
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="flex-1 text-xs sm:text-sm">
                    Add New
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <TabsContent value="select">
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            onSelectChange(value);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.orderItemName}>
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
                          value={selectedTab === "custom" ? field.value : ""}
                          onChange={(e) => {
                            const value = e.target.value.trim();
                            handleCustomInputChange(value);
                          }}
                        />
                      </FormControl>
                    </TabsContent>
                  </div>

                  <div className="block sm:hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={onRemove}
                      disabled={!canRemove}
                      className="mt-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Tabs>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex items-center space-x-2 mt-2 sm:mt-12">
        <div className="w-20 sm:w-24">
          <FormField
            control={control}
            name={`orderItems.${index}.qty`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Qty"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : e.target.value;
                      field.onChange(value);
                    }}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="hidden sm:block">
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} disabled={!canRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
