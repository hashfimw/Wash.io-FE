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
  }
  
  export interface OrderItem {
    id: number;
    qty?: number;
    orderItemName: string;
  }
  
  export interface Payment {
    id: number;
    totalPrice: number;
    paymentStatus: 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'SUCCEEDED';
    paymentMethod?: string;
    snapToken?: string;
    snapRedirectURL?: string;
  }
  
  export interface TransportJob {
    id: number;
    transportType: 'PICKUP' | 'DELIVERY';
    isCompleted: boolean;
    distance: number;
    driver?: {
      user: {
        fullName: string;
        avatar: string;
      }
    };
  }
  
  export interface Order {
    id: number;
    orderStatus: string;
    isPaid: boolean;
    createdAt: string;
    updatedAt: string;
    customerAddress: Address;
    outlet: {
      id: number;
      outletName: string;
      outletAddress: Address;
    };
    OrderItem: OrderItem[];
    TransportJob: TransportJob[];
    Payment?: Payment;
    laundryPrice?: number;
    laundryWeight?: number;
  }
  
  // API response types
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }