import { Role } from "@/types/customer";

export interface User {
  id: number;
  fullName: string | null;
  email: string;
  avatar: string;
  isVerified: boolean;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdatePayload {
  fullName?: string;
  email?: string;
}

export interface AvatarUpdatePayload {
  id: number;
  file: File;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}
