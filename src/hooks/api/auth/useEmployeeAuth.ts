import { useState, useEffect } from "react";
import axios from "axios";
import { User } from "@/types/customer";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
}

export const useEmployeeAuth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);

        const decoded: any = JSON.parse(atob(token.split(".")[1]));

        const userResponse = await api.get(`/users/${decoded.id}`);
        const userData = userResponse.data.user;
        setUser(userData);

        return {
          message: response.data.message,
          data: {
            token,
            user: userData,
          },
        };
      }

      return null;
    } catch (err: any) {
      console.log("Login Error:", {
        status: err.response?.status,
        data: err.response?.data,
        error: err,
      });
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        return null;
      }

      const decoded: any = JSON.parse(atob(token.split(".")[1]));

      const response = await api.get(`/users/${decoded.id}`);
      const userData = response.data.user;
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 403)
      ) {
        logout();
      }
      setError("Failed to fetch user details");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login-employee";
  };

  const checkAuth = (): boolean => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    getCurrentUser,
    checkAuth,
    isAuthenticated: !!user && !!localStorage.getItem("token"),
  };
};
