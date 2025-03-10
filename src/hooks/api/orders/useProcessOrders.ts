import axios from "axios";
import { Order, OrderItem, ProcessOrderRequest } from "@/types/order";
import { ApiResponse } from "@/types/outlet";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const processOrder = {
  processOrder: async (data: ProcessOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>("/orders/process-order", data);
    return response.data;
  },

  getOrderItemTemplates: async (): Promise<ApiResponse<OrderItem[]>> => {
    try {
      const response = await api.get<ApiResponse<OrderItem[]>>("/orders/items");
      console.log("Template response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  },
};
