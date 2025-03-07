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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UserResponse {
  meta: any;
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
