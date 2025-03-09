"use client";

import { useAddress } from "@/hooks/api/request-order/useAddress";
import { useEffect } from "react";
import OrderForm from "./orders-page/orderForm";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Box } from "lucide-react";

const CreatePickupOrder = () => {
  const { getAllAddresses, error, loading } = useAddress();

  useEffect(() => {
    // Fetch addresses when component mounts
    const fetchAddresses = async () => {
      try {
        await getAllAddresses();
      } catch (err) {
        console.error("Error fetching addresses:", err);
        toast({
          title: "Fetching Address",
          description: "Failed to load addresses. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchAddresses();
  }, [getAllAddresses]);

  return (
    <section className="bg-gradient-to-b from-[#E7FAFE] to-white p-4 sm:p-6 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 mt-20">
          Create New <span className="text-orange-500">Laundry</span> Order
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading your addresses...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 sm:p-4 rounded-lg text-center text-sm sm:text-base mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Order Form */}
        <Card className="overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
          <CardContent className="p-4 sm:p-5">
            <OrderForm />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CreatePickupOrder;
