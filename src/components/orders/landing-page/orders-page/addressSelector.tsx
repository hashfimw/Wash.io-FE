"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddress } from "@/hooks/api/request-order/useAddress";
import { Address } from "@/types/requestOrder";
import { MapPin, Home, Building, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AddressSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
}

const AddressSelector = ({
  value,
  onChange,
  error,
  touched,
}: AddressSelectorProps) => {
  const {
    loading,
    error: fetchError,
    getAllAddresses,
  } = useAddress();

  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response: Address[] = await getAllAddresses();
        setAddresses(response);
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      }
    };
    fetchAddress();
  }, [getAllAddresses]);

  // Format the address for better display
  const formatAddressForDisplay = (address: Address) => {
    return {
      main: address.addressLine,
      details: [address.village, address.district, address.regency, address.province]
        .filter(Boolean)
        .join(", "),
      isPrimary: address.isPrimary,
    };
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="addressId" className="flex items-center text-base font-medium">
        <MapPin className="w-4 h-4 mr-1.5 text-orange-500" />
        Select Delivery Address
      </Label>
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Loading your saved addresses...</span>
          </div>
        </div>
      ) : (
        <>
          <Select
            value={value ? String(value) : ""}
            onValueChange={onChange}
            disabled={loading}
          >
            <SelectTrigger className="w-full bg-white border-gray-200 hover:border-orange-300 focus:ring-orange-500 h-11">
              <SelectValue
                placeholder={
                  loading
                    ? "Loading addresses..."
                    : "Select a delivery address"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {fetchError ? (
                <div className="p-3 flex items-start space-x-2 text-red-600">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <p className="font-medium">Error fetching addresses</p>
                    <p className="text-xs mt-1">Please try again later</p>
                  </div>
                </div>
              ) : addresses.length > 0 ? (
                addresses.map((address) => {
                  const formattedAddress = formatAddressForDisplay(address);
                  return (
                    <SelectItem 
                      key={address.id} 
                      value={String(address.id)}
                      className="py-3 pl-3 pr-2 focus:bg-orange-50 data-[highlighted]:bg-orange-50 data-[highlighted]:text-orange-900"
                    >
                      <div className="flex items-start">
                        <div className="mr-2 mt-1">
                          {address.isPrimary ? (
                            <Home className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Building className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center">
                            {formattedAddress.main}
                            {address.isPrimary && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full flex items-center">
                                <CheckCircle className="w-3 h-3 mr-0.5" />
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {formattedAddress.details}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })
              ) : (
                <div className="p-3 text-center text-gray-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No addresses available</p>
                  <p className="text-xs mt-1">Add a new address to continue</p>
                </div>
              )}
            </SelectContent>
          </Select>

          {touched && error && (
            <div className="flex items-center mt-1.5 text-sm text-red-500">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AddressSelector;