import { useMemo } from 'react';
import axios from 'axios';

/**
 * Custom hook to create an axios instance with authentication
 */
const useApi = () => {
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add authorization header if token exists
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, []);

  return api;
};

export default useApi;