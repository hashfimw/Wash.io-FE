// src/types/customer.ts
export interface User {
  id: number;
  fullName: string | null;
  email: string;
  role: string;
  avatar: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  total_page: number;
  page: number;
  limit: number;
  users: User[];
}

export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
}
