// src/components/orders/ProcessOrderForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

import { ProcessOrderRequest, OrderItem } from "@/types/order";
import { processOrder } from "@/hooks/api/orders/useProcessOrders";
import { useOrderItems } from "@/hooks/api/orders/useOrderItems";
import { calculateLaundryPrice, formatCurrency } from "@/utils/price";
import { OrderItemRow } from "./OrderItemRow";

// Form schema validation
const formSchema = z.object({
  orderId: z.number().positive(),
  laundryWeight: z.number().min(0.1, "Weight must be greater than 0"),
  orderItems: z
    .array(
      z.object({
        orderItemName: z.string().min(1, "Item name is required"),
        qty: z.coerce
          .number()
          .int("Quantity must be a whole number")
          .min(1, "Quantity must be at least 1")
          .optional()
          .refine((val) => val !== undefined, "Quantity is required"),
      })
    )
    .min(1, "At least one item must be added"),
});
export type ProcessOrderFormValues = z.infer<typeof formSchema>;

interface ProcessOrderFormProps {
  orderId: number;
  onSuccess: () => void;
  role: string;
}

export function ProcessOrderForm({
  orderId,
  onSuccess,
  role,
}: ProcessOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templates, setTemplates] = useState<OrderItem[]>([]);

  // Initialize form
  const form = useForm<ProcessOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId,
      laundryWeight: undefined,
      orderItems: [{ orderItemName: "", qty: undefined }],
    },
  });

  // Use custom hook for item management
  const { fields, addItem, removeItem, handleItemChange, handleInputChange } =
    useOrderItems(form);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await processOrder.getOrderItemTemplates();
        console.log("Raw template response:", response);

        if (response && response.data) {
          // Handle berbagai kemungkinan struktur response
          const templateData = Array.isArray(response.data)
            ? response.data
            : [];

          console.log("Processed templates:", templateData);
          setTemplates(templateData);
        } else {
          console.warn("No template data found in response");
          setTemplates([]);
        }
      } catch (error) {
        console.error("Failed to fetch templates", error);
        toast({
          title: "Error",
          description: "Failed to load item templates",
          variant: "destructive",
        });
      }
    };

    fetchTemplates();
  }, []);

  // Handle form submission
  const onSubmit = async (data: ProcessOrderFormValues) => {
    // Check for duplicate items
    const itemNames = new Set<string>();
    for (const item of data.orderItems) {
      const lowerCaseName = item.orderItemName.toLowerCase();
      if (itemNames.has(lowerCaseName)) {
        toast({
          title: "Validation Error",
          description: "Duplicate items are not allowed",
          variant: "destructive",
        });
        return;
      }
      itemNames.add(lowerCaseName);
    }

    setIsSubmitting(true);
    try {
      await processOrder.processOrder(data);
      toast({
        title: "Success",
        description: "Order processed successfully",
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to process order", error);
      toast({
        title: "Error",
        description: "Failed to process order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Process Order #{orderId}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="laundryWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md font-medium">
                    Laundry Weight (kg)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Enter weight in kg"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">Laundry Items</h3>
                <Button
                  type="button"
                  variant="oren"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <OrderItemRow
                  key={field.id} // Use field.id as key for proper reconciliation
                  index={index}
                  control={form.control}
                  templates={templates}
                  canRemove={fields.length > 1}
                  onRemove={() => removeItem(index)}
                  onSelectChange={(value) => handleItemChange(value, index)}
                  onInputChange={(value) => handleInputChange(value, index)}
                />
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              Total Price:{" "}
              {formatCurrency(
                calculateLaundryPrice(form.watch("laundryWeight"))
              )}
            </div>

            <CardFooter className="px-0 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                variant={"birtu"}
                className="w-full"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Process Order
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
