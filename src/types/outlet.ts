// src/types/outlet.ts
// Field yang bisa di-sort
export type OutletSortField = "outletName" | "addressLine" | "province" | "district" | "regency" | "village";

export interface SortConfig {
  field: OutletSortField;
  direction: "asc" | "desc";
}

export interface CreateOutletInput {
  outletName: string;
  addressLine: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  latitude?: string;
  longitude?: string;
}

export interface UpdateOutletInput {
  outletName: string;
  addressLine: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  latitude?: string;
  longitude?: string;
}

export interface Outlet {
  createdAt: string | number | Date;
  id: number;
  outletName: string;
  outletAddress: {
    addressLine: string;
    province: string;
    regency: string;
    district: string;
    village: string;
    latitude?: string;
    longitude?: string;
  };
}

export interface MetaData {
  page: number;
  limit: number;
  total: number;
  totalRecords: number;
}

export interface ApiResponse<T> {
  meta: MetaData;
  success: boolean;
  data: T;
  message: string;
}

export interface OutletParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortList?: "asc" | "desc";
}

export interface OutletResponse {
  message: string;
  data: Outlet[];
  meta: MetaData;
}
