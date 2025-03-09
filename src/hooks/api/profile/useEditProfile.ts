"use client";

import { toast } from "@/components/ui/use-toast";
import { UserUpdatePayload } from "@/types/profile";
import { useState } from "react";

/**
 * Custom hook for editing user profile information
 */
export const useEditProfile = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // Update user profile (name, email, etc.)
  const updateProfile = async (id: number, payload: UserUpdatePayload) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      toast({
        title: "Profile Updated Successfully",
        description: "✅ Your profile has been updated!",
        variant: "default",
      });

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Update Failed",
        description: `${errorMessage}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update user avatar
  const updateAvatar = async (userId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", String(userId));
  
    try {
      const response = await fetch(`${API_URL}/users/avatar-cloud`, {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      const data = await response.json();
      console.log("Backend Response:", data); // ✅ Debug respons backend
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to update avatar");
      }
  
      if (data.avatarUrl) {
        return data.avatarUrl;
      } else {
        console.warn("Backend did not return avatarUrl");
        return null;
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      return null;
    }
  };
  

  return {
    isUpdating,
    avatarUrl, // Tambahkan avatar ke return agar bisa digunakan di komponen lain
    updateProfile,
    updateAvatar,
  };
};
