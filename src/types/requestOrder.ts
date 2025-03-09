/**
 * Base address interface matching the Prisma schema
 */
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

/**
 * Order status enum matching the Prisma schema
 */
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

/**
 * Transport type enum matching the Prisma schema
 */
export type TransportType = "PICKUP" | "DELIVERY";

/**
 * Payment status enum matching the Prisma schema
 */
export type PaymentStatus = "PENDING" | "CANCELLED" | "EXPIRED" | "SUCCEEDED";

/**
 * OrderItem interface matching the Prisma schema
 */
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

/**
 * Payment interface matching the Prisma schema
 */
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

/**
 * TransportJob interface matching the Prisma schema
 */
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

/**
 * Outlet interface matching the Prisma schema
 */
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

/**
 * Order interface matching the Prisma schema
 */
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

/**
 * InitiatePaymentResponse interface for payment initiation
 */
export interface InitiatePaymentResponse {
  payment: Payment;
  snapToken?: string;
  redirectUrl?: string;
}
