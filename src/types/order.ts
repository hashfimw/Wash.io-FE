// src/types/order.ts

export interface OrderItem {
  id: number;
  orderId: number;
  qty: number;
  orderItemName: string;
}

export interface LaundryJob {
  id: number;
  station: WorkerStation;
  isCompleted: boolean;
  worker?: {
    user: {
      fullName: string;
    };
  };
  createdAt: Date;
}

export interface TransportJob {
  id: number;
  transportType: TransportType;
  isCompleted: boolean;
  driver?: {
    user: {
      fullName: string;
    };
  };
  createdAt: Date;
}

export interface Order {
  id: number;
  orderStatus: OrderStatus;
  outletId: number;
  outlet: {
    outletName: string;
  };
  customerAddress: {
    addressLine: string;
  };
  OrderItem: OrderItem[];
  LaundryJob: LaundryJob;
  TransportJob: TransportJob;
  laundryWeight?: number;
  laundryPrice?: number;
  isPaid: boolean;
  createdAt: Date;
}

export interface Timeline {
  stage: string;
  worker?: string;
  driver?: string;
  status: string;
  timestamp: Date;
}

export interface OrderTrackingResponse {
  order: Order;
  timeline: Timeline[];
}

export enum OrderStatus {
  WAITING_FOR_PICKUP_DRIVER = "WAITING_FOR_PICKUP_DRIVER",
  ON_THE_WAY_TO_CUSTOMER = "ON_THE_WAY_TO_CUSTOMER",
  ON_THE_WAY_TO_OUTLET = "ON_THE_WAY_TO_OUTLET",
  ARRIVED_AT_OUTLET = "ARRIVED_AT_OUTLET",
  READY_FOR_WASHING = "READY_FOR_WASHING",
  BEING_WASHED = "BEING_WASHED",
  WASHING_COMPLETED = "WASHING_COMPLETED",
  BEING_IRONED = "BEING_IRONED",
  IRONING_COMPLETED = "IRONING_COMPLETED",
  BEING_PACKED = "BEING_PACKED",
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  READY_FOR_DELIVERY = "READY_FOR_DELIVERY",
  WAITING_FOR_DELIVERY_DRIVER = "WAITING_FOR_DELIVERY_DRIVER",
  BEING_DELIVERED_TO_CUSTOMER = "BEING_DELIVERED_TO_CUSTOMER",
  RECEIVED_BY_CUSTOMER = "RECEIVED_BY_CUSTOMER",
  COMPLETED = "COMPLETED",
  CANCELLED_BY_CUSTOMER = "CANCELLED_BY_CUSTOMER",
  CANCELLED_BY_OUTLET = "CANCELLED_BY_OUTLET",
}

export enum WorkerStation {
  WASHING = "WASHING",
  IRONING = "IRONING",
  PACKING = "PACKING",
}

export enum TransportType {
  PICKUP = "PICKUP",
  DELIVERY = "DELIVERY",
}

export interface OrderItem {
  id: number;
  orderId: number;
  qty: number;
  orderItemName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: {
    meta: any;
    data: T;
  };
}

export interface ProcessOrderRequest {
  orderId: number;
  laundryWeight: number;
  orderItems: {
    orderItemName: string;
    qty: number;
  }[];
}

export interface OrderParams {
  page?: number;
  limit?: number;
  outletId?: number;
  orderStatus?: OrderStatus | "all status";
  search?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export interface OrderResponse {
  filter(arg0: (order: { orderStatus: string }) => boolean): unknown;
  data: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalRecords: number;
  };
}
