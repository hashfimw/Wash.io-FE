import { GetNotificationsRequest, GetNotificationsResponse } from "@/types/notification";
import axios from "axios";
import { useState } from "react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

// Interceptor untuk token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useNotification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNotifications = async (params: GetNotificationsRequest) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.requestType) queryParams.append("requestType", params.requestType.toString());

      const response = await api.get<GetNotificationsResponse>(`/notifications?${queryParams}`);
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to fetch notifications");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUnreadNotificationsCount = async () => {
    try {
      setLoading(true);

      const response = await api.get<{ data: number }>("/notifications/count-unread");

      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to count unread notifications");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsReadById = async (notificationId: number) => {
    try {
      setLoading(true);

      const response = await api.patch<{ message: string }>(`/notifications/${notificationId}`);

      return response.data.message;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to alter notification");
      throw err;
    } finally {
    }
  };

  const markAllUnreadNotificationAsRead = async () => {
    try {
      setLoading(true);

      const response = await api.patch<{ message: string }>(`/notifications`);

      return response.data.message;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to alter notifications");
      throw err;
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  return {
    loading,
    error,
    getNotifications,
    getUnreadCount: getUnreadNotificationsCount,
    markAsReadById: markNotificationAsReadById,
    markAllAsRead: markAllUnreadNotificationAsRead,
  };
};
