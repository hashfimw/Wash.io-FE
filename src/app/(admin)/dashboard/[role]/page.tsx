// File: app/dashboard/[role]/page.tsx
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { cookies } from "next/headers";
import DashboardWrapper from "@/components/admin/OverviewWrapper";

// Metadata untuk halaman
export const metadata: Metadata = {
  title: "Dashboard - Wash.io Laundry",
  description: "Your all-in-one laundry management solution",
};

// Helper function untuk mendapatkan auth token dari cookies
function getAuthToken() {
  const cookieStore = cookies();
  let token = cookieStore.get("token")?.value;
  return token;
}

// Service functions untuk mengambil data langsung dari API
async function getOutlets() {
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

async function getUsers() {
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
async function getNewCustomersThisMonth() {
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
    const newCustomers = data.users.filter((user: any) => new Date(user.createdAt) >= firstDayOfMonth);

    return newCustomers.length;
  } catch (error) {
    console.error("Error counting new customers this month:", error);
    return 0;
  }
}

async function getPendingOrders() {
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

async function getAllOrders() {
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

// Helper function untuk menghitung item baru bulan ini
function getItemsCreatedThisMonth(items: any[]) {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  return items.filter((item) => new Date(item.createdAt) >= firstDayOfMonth).length;
}

// Helper function untuk menghitung order hari ini
function getOrdersCreatedToday(orders: any[]) {
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

// Untuk fleksibilitas dalam ekstraksi bentuk data
function extractOrdersArray(ordersResponse: any): any[] {
  if (ordersResponse?.data?.data?.data) {
    return ordersResponse.data.data.data;
  } else if (ordersResponse?.data?.data) {
    return Array.isArray(ordersResponse.data.data) ? ordersResponse.data.data : [];
  } else if (Array.isArray(ordersResponse?.data)) {
    return ordersResponse.data;
  }
  return [];
}

// Komponen Dashboard utama
export default async function Dashboard({ params }: { params?: { role?: string } }) {
  try {
    // Get auth token for debugging
    const token = getAuthToken();

    // Jika tidak ada token, tampilkan pesan login
    if (!token) {
      return (
        <div className="space-y-6 p-4 sm:p-6">
          <div className="bg-gradient-to-r from-birtu to-birmud rounded-lg p-6 text-oren shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-putih">Welcome to Wash.io Laundry</h1>
                <p className="text-lg text-putbir opacity-90">Your all-in-one laundry management solution</p>
              </div>
              <Waves className="h-16 w-16 text-birtu" />
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <p className="text-center py-4">Please login to view your dashboard</p>
              <div className="flex justify-center">
                <Link href="/login-admin">
                  <Button>Login</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Mengambil semua data dari API secara paralel
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

    // Memproses data
    const outletsData = outletsResponse?.data || [];
    const outletsCount = outletsData.length;
    const newOutletsThisMonth = getItemsCreatedThisMonth(outletsData);

    const customersData = customersResponse?.users || [];
    // Gunakan totalCustomers jika tersedia, jika tidak gunakan panjang array
    const customersCount = customersResponse?.totalCustomers || customersData.length;
    // Gunakan hasil perhitungan dari fungsi khusus
    const newCustomersThisMonth = newCustomersCount;

    const pendingOrdersCount = Array.isArray(pendingOrders) ? pendingOrders.length : 0;

    const allOrders = extractOrdersArray(ordersResponse);
    const todayOrders = getOrdersCreatedToday(allOrders);
    const todayOrdersCount = todayOrders.length;

    // Mengambil role dari params atau default ke super-admin
    const userRoleForPath = params?.role || "super-admin";

    // Mengumpulkan data untuk diteruskan ke client component
    const initialData = {
      outletsCount,
      newOutletsThisMonth,
      customersCount,
      newCustomersThisMonth,
      pendingOrdersCount,
      todayOrdersCount,
    };

    // Render dashboard wrapper yang bisa di-refresh
    return <DashboardWrapper initialData={initialData} userRoleForPath={userRoleForPath} />;
  } catch (error) {
    console.error("Error in Dashboard component:", error);

    // Fallback UI jika terjadi error
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="bg-gradient-to-r from-birtu to-birmud rounded-lg p-6 text-oren shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-putih">Welcome to Wash.io Laundry</h1>
              <p className="text-lg text-putbir opacity-90">Your all-in-one laundry management solution</p>
            </div>
            <Waves className="h-16 w-16 text-birtu" />
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <p>Dashboard data is currently unavailable. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
