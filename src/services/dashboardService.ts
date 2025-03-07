// File: services/dashboardService.ts
import { cookies } from "next/headers";

// Definisikan interface untuk data yang dibutuhkan
export interface User {
  id: string;
  createdAt: string | Date;
  // tambahkan properti lain yang diperlukan
}

export interface Outlet {
  id: string;
  createdAt: string | Date;
  // tambahkan properti lain yang diperlukan
}

export interface Order {
  id: string;
  createdAt: string | Date;
  orderStatus: string;
  // tambahkan properti lain yang diperlukan
}

export interface OrdersResponse {
  data:
    | {
        data?:
          | Order[]
          | {
              data?: Order[];
            };
      }
    | Order[];
}

export interface OutletsResponse {
  data: Outlet[];
}

export interface UsersResponse {
  users: User[];
  totalCustomers?: number;
  total_page?: number;
  limit?: number;
}

// Helper function untuk mendapatkan auth token dari cookies
export function getAuthToken() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  return token;
}

// Service functions untuk mengambil data langsung dari API
export async function getOutlets(): Promise<OutletsResponse> {
  const token = getAuthToken();

  if (!token) {
    console.error("No auth token available for API request");
    return { data: [] };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/adm-outlets`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`Failed to fetch outlets: ${res.status} ${res.statusText}`, errorData);
      return { data: [] };
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching outlets:", error);
    return { data: [] };
  }
}

export async function getUsers(): Promise<UsersResponse> {
  const token = getAuthToken();

  if (!token) {
    console.error("No auth token available for API request");
    return { users: [], totalCustomers: 0 };
  }

  try {
    // Get the first page to get pagination info
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`Failed to fetch users: ${res.status} ${res.statusText}`, errorData);
      return { users: [], totalCustomers: 0 };
    }

    const data = await res.json();

    // Hitung total customer dari informasi pagination yang tersedia
    // totalCustomers = total_page * limit
    const totalCustomers = data.total_page * data.limit;

    // Tambahkan ke data yang sudah ada
    return { ...data, totalCustomers };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [], totalCustomers: 0 };
  }
}

// Fungsi khusus untuk menghitung customer baru bulan ini
export async function getNewCustomersThisMonth(): Promise<number> {
  const token = getAuthToken();

  if (!token) {
    console.error("No auth token available for API request");
    return 0;
  }

  try {
    // Tentukan tanggal awal bulan ini
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Parameter untuk mengambil data sebanyak mungkin (limit tinggi)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=1000`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch users for monthly count`);
      return 0;
    }

    const data = await res.json();

    // Filter users yang dibuat bulan ini
    const newCustomers = data.users.filter((user: User) => new Date(user.createdAt) >= firstDayOfMonth);

    return newCustomers.length;
  } catch (error) {
    console.error("Error counting new customers this month:", error);
    return 0;
  }
}

export async function getPendingOrders(): Promise<Order[]> {
  const allOrdersResponse = await getAllOrders();

  try {
    const allOrders = extractOrdersArray(allOrdersResponse);

    const pendingOrders = allOrders.filter((order) => order.orderStatus === "ARRIVED_AT_OUTLET");

    return pendingOrders;
  } catch (error) {
    console.error("Error processing pending orders:", error);
    return [];
  }
}

export async function getAllOrders(): Promise<OrdersResponse> {
  const token = getAuthToken();

  if (!token) {
    console.error("No auth token available for API request");
    return { data: {} };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/show-order`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(errorData);
      return { data: {} };
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return { data: {} };
  }
}

// Helper function untuk menghitung item baru bulan ini
export function getItemsCreatedThisMonth<T extends { createdAt: string | Date }>(items: T[]): number {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  return items.filter((item) => new Date(item.createdAt) >= firstDayOfMonth).length;
}

// Helper function untuk menghitung order hari ini
export function getOrdersCreatedToday(orders: Order[]): Order[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return orders.filter((order) => {
    if (!order?.createdAt) return false;
    try {
      const orderDate = new Date(order.createdAt);
      const orderDay = orderDate.getDate();
      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();

      const todayDay = today.getDate();
      const todayMonth = today.getMonth();
      const todayYear = today.getFullYear();

      return orderDay === todayDay && orderMonth === todayMonth && orderYear === todayYear;
    } catch (e) {
      console.error("Error parsing date:", e);
      return false;
    }
  });
}

export function extractOrdersArray(ordersResponse: OrdersResponse): Order[] {
  if (ordersResponse?.data) {
    // Cek jika data.data adalah array
    if (Array.isArray((ordersResponse.data as any).data)) {
      return (ordersResponse.data as any).data;
    }
    // Cek jika data adalah array
    else if (Array.isArray(ordersResponse.data)) {
      return ordersResponse.data;
    }
    // Cek jika data.data.data ada
    else if ((ordersResponse.data as any).data?.data) {
      return (ordersResponse.data as any).data.data;
    }
  }

  return [];
}
