"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { Order, OrderStatus } from "@/types/requestOrder";
import { useToast } from "@/components/ui/use-toast";
import { useOrders } from "@/hooks/api/request-order/usePublicOrders";

interface CompleteOrderButtonProps {
  order: Order;
  onComplete?: (updatedOrder: Order) => void;
  className?: string;
}

export const CompleteOrderButton = ({
  order,
  onComplete,
  className = "",
}: CompleteOrderButtonProps) => {
  const { updateOrderStatus } = useOrders();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCompleteOrder = async () => {
    setIsLoading(true);
    try {
      const updatedOrder = await updateOrderStatus(order.id, "COMPLETED");
      
      if (updatedOrder) {
        toast({
          title: "Order completed successfully",
          description: `Order #${order.id} has been marked as completed.`,
          variant: "default",
        });
        
        // Call the onComplete callback if provided
        if (onComplete) {
          onComplete(updatedOrder);
        }
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: "Failed to mark order as completed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={className}
      onClick={handleCompleteOrder}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark as Completed
        </>
      )}
    </Button>
  );
};