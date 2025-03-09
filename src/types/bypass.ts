// src/types/bypassRequest.types.ts

// Enum untuk status bypass
export enum ByPassStatus {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

// Enum untuk stasiun kerja
export enum WorkerStation {
  WASHING = "WASHING",
  IRONING = "IRONING",
  PACKING = "PACKING",
}

// Tipe untuk permintaan bypass
export interface BypassRequest {
  id: number;
  station: WorkerStation;
  isByPassRequested: boolean;
  byPassStatus: ByPassStatus | null;
  byPassNote: string | null;
  createdAt: string;
  updatedAt: string;
  workerId: number | null;
  orderId: number;
  order: {
    id: number;
    orderStatus: string;
  };
  worker: {
    id: number;
    user: {
      id: number;
      fullName: string;
      email: string;
      avatar: string;
    };
    outlet: {
      id: number;
      outletName: string;
    };
  } | null;
}

// Tipe untuk input request bypass
export interface BypassRequestInput {
  laundryJobId: number;
  byPassNote: string;
}

// Tipe untuk input handle bypass
export interface HandleBypassInput {
  laundryJobId: number;
  isApproved: boolean;
  adminNote?: string;
}

// Tipe respons API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
