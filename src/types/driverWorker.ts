import { ByPassStatus } from "./bypass";
import { OrderStatus, TransportType, WorkerStation } from "./order";

export interface JobRecord {
  id: number;
  date: string;
  orderId: number;
  transportType?: TransportType;
}

export interface GetJobsRequest {
  endPoint: "transport-jobs" | "laundry-jobs";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  requestType: "request" | "history";
  transportType?: TransportType;
}

export interface GetJobsResponse {
  data: JobRecord[];
  meta: {
    page: number;
    limit: number;
    total_pages: number;
    total_data: number;
  };
}

export interface UpdateLaundryJobInputBody {
  orderItemId: number;
  qty: number;
}

export interface GetJobByIdResponse {
  id: number;
  isCompleted: boolean;
  orderId: number;
  createdAt: string;
  updatedAt: string;
  orderStatus: OrderStatus;
  isPaid: boolean;
  employeeId: number;
  employeeName: string;
  outletId: number;
  customerName: string;
  station?: WorkerStation;
  isByPassRequested?: boolean;
  byPassNote?: string | null;
  byPassStatus?: ByPassStatus | null;
  laundryWeight?: number;
  orderItem?: {
    id: number;
    qty: number;
    orderItemName: string;
  }[];
  transportType?: TransportType;
  distance?: number;
  address?: {
    id: number;
    addressLine: string;
    province: string;
    regency: string;
    district: string;
    longitude: string;
    customerId: number;
  }[];
}
