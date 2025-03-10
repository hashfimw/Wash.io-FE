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

  return (
    <div className="space-y-2">
      <Label htmlFor="addressId">Select Address</Label>
      <Select
        value={value ? String(value) : ""}
        onValueChange={onChange}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={loading ? "Loading addresses..." : "Select an address"}
          />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem disabled value="loading">
              Loading addresses...
            </SelectItem>
          ) : fetchError ? (
            <SelectItem disabled value="error">
              Error fetching addresses
            </SelectItem>
          ) : addresses.length > 0 ? (
            addresses.map((address) => (
              <SelectItem key={address.id} value={String(address.id)}>
                {address.addressLine} - {address.regency}{" "}
                {address.isPrimary && (
                  <strong className="text-green-600">(Primary)</strong>
                )}
              </SelectItem>
            ))
          ) : (
            <SelectItem disabled value="none">
              No addresses available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {touched && error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default AddressSelector;
