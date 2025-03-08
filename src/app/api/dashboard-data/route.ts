// File: app/api/dashboard-data/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Definisikan interface untuk data yang dibutuhkan
interface User {
  id: string;
  createdAt: string;
  // tambahkan properti lain yang diperlukan
}

interface Outlet {
  id: string;
  createdAt: string;
  // tambahkan properti lain yang diperlukan
}

interface Order {
  id: string;
  createdAt: string;
  orderStatus: string;
  // tambahkan properti lain yang diperlukan
}

interface OrdersResponse {
  data?:
    | {
        data?:
          | Order[]
          | {
              data?: Order[];
            };
      }
    | Order[];
}

interface OutletsResponse {
  data: Outlet[];
}

interface UsersResponse {
  users: User[];
  totalCustomers?: number;
  total_page?: number;
  limit?: number;
}

// Helper function to get auth token from cookies
function getAuthToken(): string | undefined {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  return token;
}

// Service functions to fetch data directly from API
async function getOutlets(): Promise<OutletsResponse> {
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

async function getUsers(): Promise<UsersResponse> {
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
async function getNewCustomersThisMonth(): Promise<number> {
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=50`, {
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

// Get pending orders
// Menggunakan logika yang sama dengan hook usePendingOrders
async function getPendingOrders(): Promise<Order[]> {
  // Kita akan memanggil getAllOrders dan memfilter hasilnya
  const allOrdersResponse = await getAllOrders();

  try {
    // Ekstrak data orders dari response
    const allOrders = extractOrdersArray(allOrdersResponse);

    // Filter untuk status ARRIVED_AT_OUTLET sama seperti di hook
    const pendingOrders = allOrders.filter((order) => order.orderStatus === "ARRIVED_AT_OUTLET");
    return pendingOrders;
  } catch (error) {
    console.error("Error processing pending orders:", error);
    return [];
  }
}

async function getAllOrders(): Promise<OrdersResponse> {
  const token = getAuthToken();

  if (!token) {
    console.error("No auth token available for API request");
    return { data: [] };
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
      return { data: [] };
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return { data: [] };
  }
}

// Helper function to calculate new items this month
function getItemsCreatedThisMonth<T extends { createdAt: string | Date }>(items: T[]): number {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  return items.filter((item) => new Date(item.createdAt) >= firstDayOfMonth).length;
}

// Helper function to calculate today's orders
function getOrdersCreatedToday(orders: Order[]): Order[] {
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

// For flexibility in data shape extraction
function extractOrdersArray(ordersResponse: OrdersResponse): Order[] {
  if (
    ordersResponse?.data &&
    typeof ordersResponse.data === "object" &&
    !Array.isArray(ordersResponse.data)
  ) {
    if (ordersResponse.data.data) {
      if (
        typeof ordersResponse.data.data === "object" &&
        !Array.isArray(ordersResponse.data.data) &&
        "data" in ordersResponse.data.data
      ) {
        return (ordersResponse.data.data as { data: Order[] }).data;
      }
      if (Array.isArray(ordersResponse.data.data)) {
        return ordersResponse.data.data;
      }
    }
  } else if (Array.isArray(ordersResponse?.data)) {
    return ordersResponse.data as Order[];
  }
  return [];
}

// Definisikan interface untuk response data
interface DashboardData {
  outletsCount: number;
  newOutletsThisMonth: number;
  customersCount: number;
  newCustomersThisMonth: number;
  pendingOrdersCount: number;
  todayOrdersCount: number;
}

export async function GET(): Promise<NextResponse<DashboardData | { error: string }>> {
  try {
    // Fetch all data from API concurrently
    const [
      outletsResponse,
      customersResponse,
      pendingOrders,
      ordersResponse,
      newCustomersCount, // Tambahkan perhitungan customer baru
    ] = await Promise.all([
      getOutlets(),
      getUsers(),
      getPendingOrders(),
      getAllOrders(),
      getNewCustomersThisMonth(), // Gunakan fungsi baru untuk menghitung customer baru
    ]);

    // Process data
    const outletsData = outletsResponse?.data || [];
    const outletsCount = outletsData.length;
    const newOutletsThisMonth = getItemsCreatedThisMonth(outletsData);

    const customersData = customersResponse?.users || [];
    // Gunakan totalCustomers dari hasil perhitungan pagination
    const customersCount = customersResponse?.totalCustomers || customersData.length;
    // Gunakan hasil perhitungan dari fungsi khusus untuk customer baru bulan ini
    const newCustomersThisMonth = newCustomersCount;

    const pendingOrdersCount = Array.isArray(pendingOrders) ? pendingOrders.length : 0;

    const allOrders = extractOrdersArray(ordersResponse);
    const todayOrders = getOrdersCreatedToday(allOrders);
    const todayOrdersCount = todayOrders.length;

    // Return aggregated data
    return NextResponse.json({
      outletsCount,
      newOutletsThisMonth,
      customersCount,
      newCustomersThisMonth,
      pendingOrdersCount,
      todayOrdersCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
