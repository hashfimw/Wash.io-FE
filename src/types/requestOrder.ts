export interface AddressApiResponse {
  data?: Address[];
}

export interface Address {
  id: number;
  isPrimary: boolean;
  addressLine: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  latitude: string;
  longitude: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  customerId?: number;
}

export type OrderStatus =
  | "ARRIVED_AT_OUTLET"
  | "READY_FOR_WASHING"
  | "BEING_WASHED"
  | "WASHING_COMPLETED"
  | "BEING_IRONED"
  | "IRONING_COMPLETED"
  | "BEING_PACKED"
  | "AWAITING_PAYMENT"
  | "READY_FOR_DELIVERY"
  | "WAITING_FOR_DELIVERY_DRIVER"
  | "BEING_DELIVERED_TO_CUSTOMER"
  | "RECEIVED_BY_CUSTOMER"
  | "COMPLETED"
  | "CANCELLED_BY_CUSTOMER"
  | "CANCELLED_BY_OUTLET"
  | "WAITING_FOR_PICKUP_DRIVER"
  | "ON_THE_WAY_TO_CUSTOMER"
  | "ON_THE_WAY_TO_OUTLET";

export type TransportType = "PICKUP" | "DELIVERY";

export type PaymentStatus = "PENDING" | "CANCELLED" | "EXPIRED" | "SUCCEEDED";

export interface OrderItem {
  id: number;
  qty?: number;
  orderItemName: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  orderId?: number;
}

export interface Payment {
  id: number;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  snapToken?: string;
  snapRedirectURL?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  orderId?: number;
}

export interface TransportJob {
  id: number;
  transportType: TransportType;
  isCompleted: boolean;
  distance: number;
  orderId: number;
  driverId?: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  driver?: {
    id?: number;
    user: {
      id?: number;
      fullName: string;
      avatar: string;
    };
  };
}

export interface Outlet {
  id: number;
  outletName: string;
  outletAddressId: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  outletAddress: Address;
}

export interface Order {
  id: number;
  orderStatus: OrderStatus;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  customerAddressId: number;
  customerAddress: Address;
  outletId: number;
  outlet: Outlet;
  OrderItem: OrderItem[];
  TransportJob: TransportJob[];
  Payment?: Payment;
  laundryPrice?: number;
  laundryWeight?: number;
}

export interface InitiatePaymentResponse {
  payment: Payment;
  snapToken?: string;
  redirectUrl?: string;
}
