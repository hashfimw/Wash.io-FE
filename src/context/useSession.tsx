"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { User } from "@/types/customer";

interface SessionContextType {
  isAuth: boolean;
  user: User | null;
  loading: boolean;
  checkSession: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateSessionUser: (userData: User) => void; // New function added
}

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const base_url =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // ✅ Cek sesi dan pastikan user diperbarui
  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`${base_url}/auth/session`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch session");

      const result = await res.json();

      if (result) {
        setUser(result);
        setIsAuth(true);
      } else {
        throw new Error("No user data received");
      }
    } catch (error) {
      console.error("Session check failed:", error);
      resetSession();
    } finally {
      setLoading(false);
    }
  }, [base_url]);

  const login = async (token: string) => {
    console.log("🔹 Storing token and fetching session...");
    localStorage.setItem("token", token);
    await checkSession();
  };

  const logout = () => {
    console.log("🔹 Logging out...");
    localStorage.removeItem("token");
    resetSession();
  };

  const resetSession = () => {
    setIsAuth(false);
    setUser(null);
  };

  const updateSessionUser = (userData: User) => {
    setUser(userData);
    setIsAuth(true);
    try {
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error updating user in localStorage:", error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      checkSession();
    } else {
      setLoading(false);
    }
  }, [checkSession]);

  return (
    <SessionContext.Provider
      value={{
        isAuth,
        user,
        loading,
        checkSession,
        login,
        logout,
        updateSessionUser, 
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};