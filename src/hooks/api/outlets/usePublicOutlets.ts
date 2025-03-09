import { useState } from "react";
import axios from "axios";
import { Outlet, OutletParams } from "@/types/outlet";

// Create a separate API instance without auth interceptor for public endpoints
const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

interface ApiResponseType {
  message: string;
  data: Outlet[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalRecords: number;
  };
}

export const usePublicOutlets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const getPublicOutlets = async (params: OutletParams = {}): Promise<ApiResponseType> => {
    try {
      setLoading(true);

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortList) queryParams.append("sortList", params.sortList);

      const url = `/outlets${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await publicApi.get<ApiResponseType>(url);
      setOutlets(response.data.data || []);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch public outlets:", err);
      setError("Failed to fetch outlets");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    outlets,
    loading,
    error,
    getPublicOutlets,
  };
};
