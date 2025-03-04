import { useState, useCallback } from "react";
import axios from "axios";

interface Address {
  id: number;
  addressLine: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  isPrimary: boolean;
  // Add any other fields your address might have
}

interface AddressParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface AddressApiResponse {
  message: string;
  data: Address[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalRecords: number;
  };
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

// Interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAddress = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get all user addresses
  const getAllAddresses = useCallback(async (params: AddressParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `/address${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      // const url = `/address`; // Menghilangkan query params untuk sementara
      console.log("Fetching address", url);
      

      const response = await api.get<AddressApiResponse>(url);
      setAddresses(response.data.data || []);
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to fetch addresses');
      } else {
        setError('An unexpected error occurred');
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get address by ID
  const getAddressById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ message: string; data: Address }>(`/address/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to fetch address');
      } else {
        setError('An unexpected error occurred');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new address
  const createAddress = useCallback(async (addressData: Omit<Address, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<{ message: string; data: Address }>('/address', addressData);
      await getAllAddresses();
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create address');
      } else {
        setError('An unexpected error occurred');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAllAddresses]);

  // Update address
  const updateAddress = useCallback(async (id: number, addressData: Partial<Address>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch<{ message: string; data: Address }>(`/address/${id}`, addressData);
      await getAllAddresses();
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to update address');
      } else {
        setError('An unexpected error occurred');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAllAddresses]);

  // Delete address
  const deleteAddress = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/address/${id}`);
      await getAllAddresses();
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to delete address');
      } else {
        setError('An unexpected error occurred');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAllAddresses]);

  return {
    addresses,
    loading,
    error,
    getAllAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress
  };
};