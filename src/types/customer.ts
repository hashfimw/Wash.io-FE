// types/customer.ts

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  OUTLET_ADMIN = "OUTLET_ADMIN",
  WORKER = "WORKER",
  DRIVER = "DRIVER",
  CUSTOMER = "CUSTOMER",
}

export interface User {
  id: number;
  fullName: string | null;
  email: string;
  password?: string;
  avatar: string;
  isVerified: boolean;
  role: Role;
  token?: string | null;
  tokenExpiresIn?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
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

export interface ApiResponse<T> {
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalRecords: number;
  };
}
