// File: app/dashboard/[role]/page.tsx
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DashboardWrapper from "@/components/admin/OverviewWrapper";
import {
  extractOrdersArray,
  getAllOrders,
  getAuthToken,
  getItemsCreatedThisMonth,
  getNewCustomersThisMonth,
  getOrdersCreatedToday,
  getOutlets,
  getPendingOrders,
  getUsers,
} from "@/services/dashboardService";
import { DashboardData } from "@/types/overviewDashboard";

// Metadata untuk halaman
export const metadata: Metadata = {
  title: "Dashboard - Wash.io Laundry",
  description: "Your all-in-one laundry management solution",
  icons: "/washio-birtu.png",
};

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
    const initialData: DashboardData = {
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
