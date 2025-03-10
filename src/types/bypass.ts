export enum ByPassStatus {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}
export enum WorkerStation {
  WASHING = "WASHING",
  IRONING = "IRONING",
  PACKING = "PACKING",
}

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

export interface BypassRequestInput {
  laundryJobId: number;
  byPassNote: string;
}

export interface HandleBypassInput {
  laundryJobId: number;
  isApproved: boolean;
  adminNote?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
