"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Camera, Loader2 } from "lucide-react";
import { User } from "@/types/profile";
import { useEditProfile } from "@/hooks/api/profile/useEditProfile";

interface AvatarUploadProps {
  user: User;
  onAvatarUpdate: (newAvatarUrl: string) => void; // Add this prop
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ user, onAvatarUpdate }) => {
  const { updateAvatar, isUpdating, avatarUrl } = useEditProfile(); // Ambil avatar dari hook
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatar);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync avatar terbaru dari useEditProfile ke komponen
  useEffect(() => {
    if (avatarUrl) setPreviewUrl(avatarUrl);
  }, [avatarUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    previewFile(file);
  
    try {
      const newAvatarUrl = await updateAvatar(user.id, file);
      if (newAvatarUrl) {
        setPreviewUrl(newAvatarUrl);
        onAvatarUpdate(newAvatarUrl); // Call the callback
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };
  

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (!validateFile(file)) return;

    previewFile(file);
    try {
      const response = await updateAvatar(user.id, file);
      if (response) setPreviewUrl(response);
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  // Validasi format & ukuran file
  const validateFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, and WEBP images are allowed.");
      return false;
    }

    if (file.size > maxSize) {
      alert("File size should not exceed 5MB.");
      return false;
    }

    return true;
  };

  return (
    <div
      className="relative group cursor-pointer mx-auto"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Avatar Container */}
      <div
        className={`h-32 w-32 md:h-36 md:w-36 relative rounded-full overflow-hidden border-4 border-white shadow-lg transition-all duration-500 ${
          isDragging ? "scale-105 border-birtu" : ""
        } ${isUpdating ? "opacity-70" : ""}`}
      >
        <img
          src={previewUrl || "/default-user-avatar.png"}
          alt={user.fullName || "User Avatar"}
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.src = "/default-user-avatar.png")}
        />

        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="text-white flex flex-col items-center">
          <Camera className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Change Photo</span>
        </div>
      </div>

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Dragging Indicator */}
      {isDragging && (
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-birtu animate-pulse" />
      )}

      {/* Upload Button */}
      <div className="absolute bottom-0 right-0 bg-birtu text-white p-2 rounded-full shadow-lg transform transition-transform duration-300 group-hover:scale-110">
        <UploadCloud className="h-4 w-4" />
      </div>
    </div>
  );
};

export default AvatarUpload;
