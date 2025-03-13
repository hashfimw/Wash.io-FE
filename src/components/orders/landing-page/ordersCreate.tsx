"use client";

import { useAddress } from "@/hooks/api/request-order/useAddress";
import { useEffect, useState } from "react";
import OrderForm from "./orders-page/orderForm";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Truck, Loader2, AlertCircle, WashingMachine, ArrowRight } from "lucide-react";

const CreatePickupOrder = () => {
  const { getAllAddresses, error, loading } = useAddress();
  const router = useRouter();
  const { toast } = useToast();
  const [formStep, setFormStep] = useState(0);
  
  useEffect(() => {
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
  }, [getAllAddresses, toast]);

  const handleOrderCreated = () => {
    toast({
      title: "Order Created Successfully",
      description: "Your laundry order has been placed. Redirecting to orders page...",
      variant: "default",
    });
    
    setTimeout(() => {
      router.push("/orders");
    }, 1500);
  };

  return (
    <section className="bg-gradient-to-b from-[#E7FAFE] to-white min-h-screen p-4 sm:p-6 md:p-8 pt-32 sm:pt-20 md:pt-24">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 sm:mb-4 relative inline-block">
            Create New <span className="text-orange-500">Laundry</span> Order
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-orange-500 rounded-full opacity-80"></div>
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Fill out the form below to schedule a pickup for your laundry. We&apos;ll handle the rest!
          </p>
        </div>
        
        {/* Order Process Steps */}
        <div className="hidden sm:block mb-8">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            <div className={`flex flex-col items-center ${formStep >= 0 ? 'text-orange-500' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${formStep >= 0 ? 'bg-orange-100 border-2 border-orange-500' : 'bg-gray-100 border-2 border-gray-200'}`}>
                <WashingMachine size={20} className={formStep >= 0 ? 'text-orange-500' : 'text-gray-400'} />
              </div>
              <span className="text-xs font-medium">Details</span>
            </div>
            
            <div className={`w-20 h-0.5 mx-1 ${formStep >= 1 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
            
            <div className={`flex flex-col items-center ${formStep >= 1 ? 'text-orange-500' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${formStep >= 1 ? 'bg-orange-100 border-2 border-orange-500' : 'bg-gray-100 border-2 border-gray-200'}`}>
                <Truck size={20} className={formStep >= 1 ? 'text-orange-500' : 'text-gray-400'} />
              </div>
              <span className="text-xs font-medium">Pickup</span>
            </div>
            
            <div className={`w-20 h-0.5 mx-1 ${formStep >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
            
            <div className={`flex flex-col items-center ${formStep >= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${formStep >= 2 ? 'bg-orange-100 border-2 border-orange-500' : 'bg-gray-100 border-2 border-gray-200'}`}>
                <ArrowRight size={20} className={formStep >= 2 ? 'text-orange-500' : 'text-gray-400'} />
              </div>
              <span className="text-xs font-medium">Confirm</span>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 sm:py-16">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
              <p className="text-sm sm:text-base text-gray-600">Loading your saved addresses...</p>
              <p className="text-xs text-gray-500 mt-2">This will only take a moment</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <Card className="border-red-100 mb-6 overflow-hidden">
            <CardContent className="p-5 bg-red-50">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-1">Error Loading Addresses</h3>
                  <p className="text-sm text-red-700">{error}</p>
                  <button 
                    className="mt-3 px-4 py-1.5 bg-white border border-red-300 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => getAllAddresses()}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Order Form */}
        {!loading && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#E7FAFE] to-transparent opacity-70 pointer-events-none"></div>
            <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
              {/* Card Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500"></div>
              
              <CardContent className="p-5 sm:p-8">
                {/* Form Title */}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-orange-500" />
                  Laundry Pickup Details
                </h3>
                
                <OrderForm 
                  onOrderCreated={handleOrderCreated} 
                />
              </CardContent>
            </Card>
            
            {/* Helpful Tips */}
            <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Helpful Tips</h4>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1 pl-5 list-disc">
                <li>Make sure your address details are correct for smooth pickup</li>
                <li>For special washing instructions, add notes to your order</li>
                <li>We&apos;ll notify you when your laundry is picked up, being processed, and ready for delivery</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CreatePickupOrder;