"use client";

import { useState, useCallback, useEffect } from "react";
import { ApiResponse } from "@/types/api";
import useApi from "../useApi";
import { Address } from "@/types/requestOrder";
import { useSession } from "@/hooks/useSession";

export const useAddress = () => {
  const api = useApi();
  const { user } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const getAllAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponse<Address[]>>("/address");
      console.log("All addresses response:", response.data);
      setAddresses(response.data.data || []);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching addresses"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [api]);

  const getAddressById = useCallback(
    async (addressId: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<ApiResponse<Address>>(
          `/address/${addressId}`
        );

        return response.data.data;
      } catch (error) {
        console.error("Error fetching address by ID:", error);
        setError(error instanceof Error ? error.message : "Address not found");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const createAddress = useCallback(
    async (addressData: Omit<Address, "id">) => {
      setLoading(true);
      setError(null);

      try {
        const payload = { ...addressData, customerId: user?.id };
        const response = await api.post<Address>("/address", payload);
        const addressId = response.data?.id;

        if (!addressId) {
          throw new Error("Invalid response format: Missing address ID");
        }
        await getAllAddresses();

        return addressId;
      } catch (error) {
        console.error("Error creating address:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred while creating address"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [api, getAllAddresses, user]
  );

  useEffect(() => {
    if (user?.id) {
      getAllAddresses();
    }
  }, [user, getAllAddresses]);

  return {
    addresses,
    loading,
    error,
    getAllAddresses,
    getAddressById,
    createAddress,
  };
};
