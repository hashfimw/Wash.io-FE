"use client";

export interface DashboardData {
  outletsCount: number;
  newOutletsThisMonth: number;
  customersCount: number;
  newCustomersThisMonth: number;
  pendingOrdersCount: number;
  todayOrdersCount: number;
  outletName?: string;
}

interface UserResponse {
  users: User[];
  total_page?: number;
  limit?: number;
  page?: number;
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1") || null;
  }
  return null;
}

export function getUserRole(): string {
  if (typeof window !== "undefined") {
    const cookieRole = document.cookie.replace(/(?:(?:^|.*;\s*)role\s*=\s*([^;]*).*$)|^.*$/, "$1");
    if (cookieRole) {
      console.log("Found role in cookie:", cookieRole);
      return convertRoleToUrlFormat(cookieRole);
    }
    return "super-admin";
  }
  return "super-admin";
}

function convertRoleToUrlFormat(role: string): string {
  const roleLower = role.toLowerCase();

  if (roleLower.includes("super")) return "super-admin";
  if (roleLower.includes("outlet")) return "outlet-admin";
  if (roleLower === "super-admin" || roleLower === "outlet-admin") {
    return roleLower;
  }
  return roleLower.replace(/_/g, "-");
}

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

export interface User {
  id: string;
  createdAt: string | Date;
  [key: string]: any;
}

export interface Order {
  id: string;
  orderStatus: string;
  createdAt: string;
  outletId?: string;
  [key: string]: any;
}

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

async function getTotalCustomers(): Promise<number> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
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
    if (data.total_page && data.limit) {
      const totalCustomers = data.total_page * data.limit;
      console.log("Calculated total customers:", totalCustomers);
      return totalCustomers;
    }
    console.log("Couldn't calculate from pagination, fetching all users");
    const allUsers = await fetchUsers(1000);
    return allUsers.length;
  } catch (error) {
    console.error("Error getting total customers:", error);
    return 0;
  }
}

async function getNewCustomersThisMonth(): Promise<number> {
  try {
    const users = await fetchUsers(1000);
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
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

function getPendingOrders(orders: Order[]): Order[] {
  return orders.filter((order) => order.orderStatus === "ARRIVED_AT_OUTLET");
}

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
export async function fetchDashboardData(role?: string): Promise<DashboardData> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
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

    const outletsData = outletsResponse.data || [];
    const outletsCount = outletsData.length;
    const newOutletsThisMonth = getNewOutletsThisMonth(outletsData);
    const pendingOrders = getPendingOrders(allOrders);
    const todayOrders = getTodayOrders(allOrders);
    const normalizedRole = role ? convertRoleToUrlFormat(role) : getUserRole();
    const isOutletAdmin = normalizedRole === "outlet-admin";

    const dashboardData: DashboardData = {
      outletsCount,
      newOutletsThisMonth,
      customersCount: totalCustomers,
      newCustomersThisMonth: newCustomersCount,
      pendingOrdersCount: pendingOrders.length,
      todayOrdersCount: todayOrders.length,
    };

    if (isOutletAdmin && outletsData.length > 0) {
      const userOutletId = getUserOutletId();
      console.log("User outlet ID:", userOutletId);

      let targetOutlet = null;

      if (userOutletId) {
        targetOutlet = outletsData.find(
          (outlet: any) =>
            outlet.id?.toString() === userOutletId || outlet.outletId?.toString() === userOutletId
        );
      }

      if (!targetOutlet && outletsData.length === 1) {
        targetOutlet = outletsData[0];
      }

      if (targetOutlet) {
        console.log("Found target outlet:", targetOutlet);
        dashboardData.outletName = targetOutlet.outletName || targetOutlet.name || "Wash.io Denpasar Barat";

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
        dashboardData.outletName = "Wash.io Denpasar Barat";
      }
    }

    return dashboardData;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

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

export async function getDashboardData(role?: string): Promise<DashboardData> {
  const normalizedRole = role ? convertRoleToUrlFormat(role) : getUserRole();
  return await fetchDashboardData(normalizedRole);
}
