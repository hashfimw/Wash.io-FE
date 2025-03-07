import { useState, useEffect } from "react";
import axios from "axios";
import { User } from "@/types/customer";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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

// Define a type for decoded token
interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

// Helper function untuk menghapus cookie
function deleteCookie(name: string) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=strict";
}

export const useAdminAuth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const decodeToken = (token: string): DecodedToken | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace("-", "+").replace("_", "/");
      return JSON.parse(atob(base64)) as DecodedToken;
    } catch (error) {
      console.error("Token decoding error:", error);
      return null;
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Login request
      const response = await api.post<LoginResponse>("/auth/login", credentials);
      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);

        // Decode token untuk mendapatkan user ID
        const decoded = decodeToken(token);

        if (!decoded) {
          throw new Error("Invalid token");
        }

        // Get user details using ID
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
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log("Login Error:", {
          status: err.response?.status,
          data: err.response?.data,
          error: err,
        });
        const errorMessage = err.response?.data?.message || "Login failed";
        setError(errorMessage);
      } else {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      }
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

      // Decode token untuk mendapatkan user ID
      const decoded = decodeToken(token);

      if (!decoded) {
        throw new Error("Invalid token");
      }

      // Get user details using ID
      const response = await api.get(`/users/${decoded.id}`);
      const userData = response.data.user;
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
        logout();
      }
      setError("Failed to fetch user details");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    // Hapus token dari localStorage
    localStorage.removeItem("token");

    // Hapus token dari cookies
    deleteCookie("token");

    // Simpan role sebelum reset user
    const userRole = user?.role;

    // Reset user state
    setUser(null);

    // Redirect sesuai dengan role user
    if (userRole === "SUPER_ADMIN" || userRole === "OUTLET_ADMIN") {
      window.location.href = "/login-admin";
    } else if (userRole === "DRIVER" || userRole === "WORKER") {
      window.location.href = "/login-employee";
    } else {
      window.location.href = "/";
    }
  };

  const checkAuth = (): boolean => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  // Auto fetch user on mount
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
