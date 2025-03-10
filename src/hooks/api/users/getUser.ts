// src/hooks/api/customers/useUsers.ts
import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { UserResponse, UserSearchParams } from "@/types/user";

// Buat axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor untuk token - client side only
if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

// Cache untuk users
const cache = {
  users: new Map(),
  timestamp: new Map(),
  cacheDuration: 0,
};

export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gunakan ref untuk tracking request terakhir
  const lastRequestRef = useRef<string | null>(null);

  const getUsers = useCallback(async (params: UserSearchParams = {}) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);

      const url = `/users?${queryParams.toString()}`;

      // Buat cache key
      const cacheKey = url;

      // Set loading state terlebih dahulu
      setLoading(true);

      // Cek cache
      const now = Date.now();
      if (
        cache.users.has(cacheKey) &&
        cache.timestamp.has(cacheKey) &&
        now - cache.timestamp.get(cacheKey)! < cache.cacheDuration
      ) {
        console.log("Returning cached user data for:", url);
        const cachedData = cache.users.get(cacheKey);
        // Set loading ke false saat mengambil dari cache
        setLoading(false);
        return cachedData;
      }

      // Jika params sama dengan request terakhir, skip request
      if (lastRequestRef.current === cacheKey) {
        console.log("Skipping duplicate request for:", url);
        // Set loading ke false saat skip request
        setLoading(false);
        if (cache.users.has(cacheKey)) {
          return cache.users.get(cacheKey);
        }
      }

      lastRequestRef.current = cacheKey;
      console.log("Fetching users from:", url);

      const response = await api.get<UserResponse>(url);

      // Simpan ke cache
      cache.users.set(cacheKey, response.data);
      cache.timestamp.set(cacheKey, now);

      console.log("User data fetched successfully");

      // Set loading ke false setelah fetch selesai
      setLoading(false);

      return response.data;
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
      // Set loading ke false pada error
      setLoading(false);
      throw err;
    }
  }, []);

  const clearCache = useCallback(() => {
    cache.users.clear();
    cache.timestamp.clear();
    console.log("User cache cleared");
  }, []);

  return {
    loading,
    error,
    getUsers,
    clearCache,
  };
};
