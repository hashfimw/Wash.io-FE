"use client";

// File: services/dashboardAPIService.ts - Dengan Customer API

// Definisi tipe data
export interface DashboardData {
  outletsCount: number;
  newOutletsThisMonth: number;
  customersCount: number;
  newCustomersThisMonth: number;
  pendingOrdersCount: number;
  todayOrdersCount: number;
  outletName?: string;
}

// Interface untuk response API users
interface UserResponse {
  users: User[];
  total_page?: number;
  limit?: number;
  page?: number;
}

// Function untuk mendapatkan auth token
export function getAuthToken(): string | null {
  // Di client side, ambil token dari cookies
  if (typeof window !== "undefined") {
    return document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1") || null;
  }
  return null;
}

// Function untuk mendapatkan role dari cookies
export function getUserRole(): string {
  if (typeof window !== "undefined") {
    // Cari berdasarkan cookie
    const cookieRole = document.cookie.replace(/(?:(?:^|.*;\s*)role\s*=\s*([^;]*).*$)|^.*$/, "$1");
    if (cookieRole) {
      console.log("Found role in cookie:", cookieRole);
      return convertRoleToUrlFormat(cookieRole);
    }

    // Default ke super-admin jika tidak ditemukan
    return "super-admin";
  }
  return "super-admin";
}

// Helper function untuk mengubah format role ke format URL
function convertRoleToUrlFormat(role: string): string {
  // Handle format SUPER_ADMIN atau format lain
  const roleLower = role.toLowerCase();

  if (roleLower.includes("super")) return "super-admin";
  if (roleLower.includes("outlet")) return "outlet-admin";

  // Jika format sudah benar, kembalikan as-is
  if (roleLower === "super-admin" || roleLower === "outlet-admin") {
    return roleLower;
  }

  // Fallback - convert underscore ke dash dan lowercase
  return roleLower.replace(/_/g, "-");
}

// Function untuk mendapatkan outletId dari cookies
export function getUserOutletId(): string | null {
  if (typeof window !== "undefined") {
    // Cek cookie untuk outletId
    const outletId = document.cookie.replace(/(?:(?:^|.*;\s*)outletId\s*=\s*([^;]*).*$)|^.*$/, "$1");

    if (outletId) {
      console.log("Found outletId:", outletId);
      return outletId;
    }

    return null;
  }
  return null;
}

// Interface untuk user data
export interface User {
  id: string;
  createdAt: string | Date;
  [key: string]: any;
}

// Interface untuk order data
export interface Order {
  id: string;
  orderStatus: string;
  createdAt: string;
  outletId?: string;
  [key: string]: any;
}

// Helper function to fetch users data
async function fetchUsers(limit: number = 50): Promise<User[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=${limit}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: UserResponse = await response.json();
    console.log("Fetched users data:", data);

    return data.users || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Helper function to calculate total customers
async function getTotalCustomers(): Promise<number> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    // Fetch the first page to get pagination info
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=1`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: UserResponse = await response.json();

    // Calculate total based on pagination info
    if (data.total_page && data.limit) {
      const totalCustomers = data.total_page * data.limit;
      console.log("Calculated total customers:", totalCustomers);
      return totalCustomers;
    }

    // Fallback: if we can't calculate from pagination, get all users
    console.log("Couldn't calculate from pagination, fetching all users");
    const allUsers = await fetchUsers(1000);
    return allUsers.length;
  } catch (error) {
    console.error("Error getting total customers:", error);
    return 0;
  }
}

// Helper function to get new customers this month
async function getNewCustomersThisMonth(): Promise<number> {
  try {
    // Get all users (with reasonable limit)
    const users = await fetchUsers(1000);

    // Calculate first day of current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Filter users created this month
    const newUsers = users.filter((user) => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= firstDayOfMonth;
    });

    console.log("New customers this month:", newUsers.length);
    return newUsers.length;
  } catch (error) {
    console.error("Error calculating new customers:", error);
    return 0;
  }
}

// Helper function untuk fetch orders
async function fetchOrders(): Promise<Order[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/show-order`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    // Extract orders array from the response based on your API structure
    let orders: Order[] = [];

    if (data.data) {
      if (Array.isArray(data.data)) {
        orders = data.data;
      } else if (data.data.data && Array.isArray(data.data.data)) {
        orders = data.data.data;
      }
    }

    console.log("Fetched orders:", orders.length);
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

// Helper function to filter pending orders (ARRIVED_AT_OUTLET)
function getPendingOrders(orders: Order[]): Order[] {
  return orders.filter((order) => order.orderStatus === "ARRIVED_AT_OUTLET");
}

// Helper function to get today's orders
function getTodayOrders(orders: Order[]): Order[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return orders.filter((order) => {
    if (!order.createdAt) return false;

    try {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    } catch (e) {
      console.error("Error parsing date:", e);
      return false;
    }
  });
}

// Helper function to calculate new outlets this month
function getNewOutletsThisMonth(outlets: any[]): number {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const newOutlets = outlets.filter((outlet) => {
    if (!outlet.createdAt) return false;

    try {
      const createdAt = new Date(outlet.createdAt);
      return createdAt >= firstDayOfMonth;
    } catch (e) {
      return false;
    }
  });

  return newOutlets.length;
}

// Function untuk fetch data dashboard dari API (selalu mengambil data terbaru)
export async function fetchDashboardData(role?: string): Promise<DashboardData> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    // Fetch all data in parallel
    const [outletsResponse, allOrders, totalCustomers, newCustomersCount] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/adm-outlets`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
      fetchOrders(),
      getTotalCustomers(),
      getNewCustomersThisMonth(),
    ]);

    console.log("Fetched outlets data:", outletsResponse);

    // Process outlets data
    const outletsData = outletsResponse.data || [];
    const outletsCount = outletsData.length;
    const newOutletsThisMonth = getNewOutletsThisMonth(outletsData);

    // Filter orders
    const pendingOrders = getPendingOrders(allOrders);
    const todayOrders = getTodayOrders(allOrders);

    // Standardized role format for comparison
    const normalizedRole = role ? convertRoleToUrlFormat(role) : getUserRole();
    const isOutletAdmin = normalizedRole === "outlet-admin";

    // Transform API response ke format dashboard data
    const dashboardData: DashboardData = {
      outletsCount,
      newOutletsThisMonth,
      customersCount: totalCustomers,
      newCustomersThisMonth: newCustomersCount,
      pendingOrdersCount: pendingOrders.length,
      todayOrdersCount: todayOrders.length,
    };

    // Jika outlet admin, cari outlet dengan ID yang sesuai
    if (isOutletAdmin && outletsData.length > 0) {
      // Cari outlets yang dimiliki user ini
      const userOutletId = getUserOutletId();
      console.log("User outlet ID:", userOutletId);

      let targetOutlet = null;

      // Jika punya outletId, cari outlet yang sesuai
      if (userOutletId) {
        targetOutlet = outletsData.find(
          (outlet: any) =>
            outlet.id?.toString() === userOutletId || outlet.outletId?.toString() === userOutletId
        );
      }

      // Jika tidak ditemukan atau tidak punya outletId, gunakan outlet pertama
      if (!targetOutlet && outletsData.length === 1) {
        targetOutlet = outletsData[0];
      }

      // Jika outlet ditemukan, gunakan nama dan filter orders
      if (targetOutlet) {
        console.log("Found target outlet:", targetOutlet);

        // Set outlet name dari data outlet
        dashboardData.outletName = targetOutlet.outletName || targetOutlet.name || "Wash.io Denpasar Barat";

        // Filter orders untuk outlet ini
        const outletId = targetOutlet.id?.toString();
        if (outletId) {
          const outletPendingOrders = pendingOrders.filter(
            (order) => order.outletId?.toString() === outletId
          );
          const outletTodayOrders = todayOrders.filter((order) => order.outletId?.toString() === outletId);

          dashboardData.pendingOrdersCount = outletPendingOrders.length;
          dashboardData.todayOrdersCount = outletTodayOrders.length;
        }
      } else {
        // Jika tidak ada outlet yang ditemukan atau tidak dapat menentukan outlet yang tepat,
        // tampilkan default yang lebih deskriptif
        dashboardData.outletName = "Wash.io Denpasar Barat";
      }
    }

    return dashboardData;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    // Fallback ke data dummy jika fetch gagal
    return {
      outletsCount: role === "outlet-admin" ? 1 : 1,
      newOutletsThisMonth: 0,
      customersCount: 30,
      newCustomersThisMonth: 5,
      pendingOrdersCount: 2,
      todayOrdersCount: 3,
      outletName: role === "outlet-admin" ? "Wash.io Denpasar Barat" : undefined,
    };
  }
}

// Function to get dashboard data - TANPA CACHING
export async function getDashboardData(role?: string): Promise<DashboardData> {
  // Selalu ambil data terbaru dari API
  const normalizedRole = role ? convertRoleToUrlFormat(role) : getUserRole();
  return await fetchDashboardData(normalizedRole);
}
