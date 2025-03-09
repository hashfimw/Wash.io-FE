"use client"

import { useState, useCallback, useEffect } from "react";
import { ApiResponse } from "@/types/api";
import useApi from "../useApi";
import { Address } from "@/types/requestOrder";
import { useSession } from "@/hooks/useSession";

/**
 * Hook for managing customer addresses
 */
export const useAddress = () => {
  const api = useApi();
  const { user } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get all addresses for the current user (only non-deleted)
   */
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
      setError(error instanceof Error ? error.message : "An error occurred while fetching addresses");
      return [];
    } finally {
      setLoading(false);
    }
  }, [api]);

  /**
   * Get a specific address by ID
   * @param addressId - The ID of the address to retrieve
   */
  const getAddressById = useCallback(async (addressId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<ApiResponse<Address>>(`/address/${addressId}`);
      console.log("Address by ID response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching address by ID:", error);
      setError(error instanceof Error ? error.message : "Address not found");
      return null;
    } finally {
      setLoading(false);
    }
  }, [api]);

  /**
   * Create a new address, ensuring isPrimary isn't duplicated
   * @param addressData - The address data without ID
   * @returns The ID of the created address
   */
  const createAddress = useCallback(async (addressData: Omit<Address, "id">) => {
    setLoading(true);
    setError(null);
  
    try {
      // if (!user || !user.id) {
      //   throw new Error("User is not authenticated");
      // }
  
      const payload = { ...addressData, customerId: user?.id };
  
      console.log("Sending address creation request with payload:", payload);
  
      // Kirim request ke backend
      const response = await api.post<Address>("/address", payload);
      
      console.log("Address creation response:", response.data);
  
      // Karena backend tidak membungkus dalam { success, data }, langsung ambil response.data.id
      const addressId = response.data?.id;
  
      if (!addressId) {
        throw new Error("Invalid response format: Missing address ID");
      }
  
      console.log("New address ID:", addressId);
  
      await getAllAddresses(); // Refresh daftar alamat
  
      return addressId;
    } catch (error) {
      console.error("Error creating address:", error);
      setError(error instanceof Error ? error.message : "An error occurred while creating address");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api, getAllAddresses, user]);
  

  /**
   * Fetch addresses automatically when user is available
   */
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
