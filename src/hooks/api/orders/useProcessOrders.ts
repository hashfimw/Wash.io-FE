// src/services/api.ts
import axios from "axios";
import { Order, OrderItem, ProcessOrderRequest } from "@/types/order";
import { ApiResponse } from "@/types/outlet";

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Order API
export const processOrder = {
  // Process order
  processOrder: async (
    data: ProcessOrderRequest
  ): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(
      "/orders/process-order",
      data
    );
    return response.data;
  },

  // Get order item templates
  getOrderItemTemplates: async (): Promise<ApiResponse<OrderItem[]>> => {
    try {
      const response = await api.get<ApiResponse<OrderItem[]>>("/orders/items");
      console.log("Template response:", response.data); // Log untuk debugging
      return response.data;
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  },
};
