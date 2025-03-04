"use client";

import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, Shirt, Waves, Calendar, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { usePendingOrders } from "@/hooks/api/orders/usePendingOrders";
import { useOrders } from "@/hooks/api/orders/useOrders";
import { useAdminAuth } from "@/hooks/api/auth/useAdminAuth";
import Link from "next/link";
import { useUsers } from "@/hooks/api/users/getUser";
import { Role } from "@/types/employee";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { setBreadcrumbItems } = useBreadcrumb();
  const { getOutlets } = useOutlets();
  const { getUsers } = useUsers();
  const { getPendingOrders } = usePendingOrders();
  const { getAllOrders } = useOrders();
  const { user } = useAdminAuth();
  const router = useRouter();
  // State variables
  const [outletsCount, setOutletsCount] = useState<number>(0);
  const [customersCount, setCustomersCount] = useState<number>(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [todayOrdersCount, setTodayOrdersCount] = useState<number>(0);
  const [newOutletsThisMonth, setNewOutletsThisMonth] = useState<number>(0);
  const [newCustomersThisMonth, setNewCustomersThisMonth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Determine user role and routing info
  const isSuperAdmin = user?.role === Role.SUPER_ADMIN;
  const userRoleForPath = isSuperAdmin ? "super-admin" : "outlet-admin";

  useEffect(() => {
    if (user) {
      // Set breadcrumb
      setBreadcrumbItems([
        {
          label: isSuperAdmin ? "Super Admin" : "Outlet Admin",
          href: `/${userRoleForPath}/dashboard`,
        },
        { label: "Dashboard" },
      ]);

      fetchDashboardData();
    }
  }, [user, setBreadcrumbItems, isSuperAdmin, userRoleForPath]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch outlets
      const outletsResponse = await getOutlets();
      setOutletsCount(outletsResponse.data.length);

      // Calculate new outlets this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const newOutlets = outletsResponse.data.filter(
        (outlet) => new Date(outlet.createdAt) >= firstDayOfMonth
      ).length;
      setNewOutletsThisMonth(newOutlets);

      // Fetch customers (users with CUSTOMER role)
      const customersResponse = await getUsers();
      setCustomersCount(customersResponse.users.length);

      // Calculate new customers this month
      const newCustomers = customersResponse.users.filter(
        (user) => new Date(user.createdAt) >= firstDayOfMonth
      ).length;
      setNewCustomersThisMonth(newCustomers);

      // Fetch pending orders
      const pendingOrders = await getPendingOrders();
      if (Array.isArray(pendingOrders)) {
        setPendingOrdersCount(pendingOrders.length);
      } else {
        console.error("Unexpected pendingOrders type:", pendingOrders);
      }

      // Fetch today's orders
      const ordersResponse = await getAllOrders();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Debug the orders response structure
      console.log(
        "Orders response structure:",
        JSON.stringify(ordersResponse).slice(0, 200) + "..."
      );

      // More flexible approach to accessing order data
      let allOrders: any[] = [];
      if (ordersResponse?.data?.data?.data) {
        // Handle nested data.data.data structure
        allOrders = ordersResponse.data.data.data;
      } else if (ordersResponse?.data?.data) {
        // Handle nested data.data structure
        allOrders = Array.isArray(ordersResponse.data.data)
          ? ordersResponse.data.data
          : [];
      } else if (Array.isArray(ordersResponse?.data)) {
        // Handle direct data array
        allOrders = ordersResponse.data;
      }

      console.log(`Found ${allOrders.length} total orders`);

      const todayOrders = allOrders.filter((order) => {
        if (!order?.createdAt) return false;
        try {
          const orderDate = new Date(order.createdAt);
          const orderDay = orderDate.getDate();
          const orderMonth = orderDate.getMonth();
          const orderYear = orderDate.getFullYear();

          const todayDay = today.getDate();
          const todayMonth = today.getMonth();
          const todayYear = today.getFullYear();

          return (
            orderDay === todayDay &&
            orderMonth === todayMonth &&
            orderYear === todayYear
          );
        } catch (e) {
          console.error("Error parsing date:", e);
          return false;
        }
      });

      console.log(`Found ${todayOrders.length} orders for today`);
      setTodayOrdersCount(todayOrders.length);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-birtu to-birmud rounded-lg p-6 text-oren shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-putih">
              Welcome to Wash.io Laundry
            </h1>
            <p className="text-lg text-putbir opacity-90">
              Your all-in-one laundry management solution
            </p>
          </div>
          <Waves className="h-16 w-16 text-birtu" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {isSuperAdmin ? "Active Outlets" : "Your Outlet"}
            </CardTitle>
            <Store className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{outletsCount}</div>
                {isSuperAdmin && (
                  <p className="text-xs text-green-600">
                    +{newOutletsThisMonth} this month
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Customers
            </CardTitle>
            <Users className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{customersCount}</div>
                <p className="text-xs text-green-600">
                  +{newCustomersThisMonth} new customers
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() =>
            router.push(`/dashboard/${userRoleForPath}/orders/process`)
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Orders
            </CardTitle>
            <Shirt className="h-6 w-6 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{pendingOrdersCount}</div>
                {pendingOrdersCount > 0 && (
                  <p className="text-xs text-yellow-600">Requires attention</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Orders
            </CardTitle>
            <Calendar className="h-6 w-6 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{todayOrdersCount}</div>
                <p className="text-xs text-gray-600">Scheduled today</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href={`/dashboard/${userRoleForPath}/orders`}>
              <Button variant="outline">
                <Shirt className="mr-2 h-4 w-4" /> New Order
              </Button>
            </Link>
            <Link href={`/dashboard/${userRoleForPath}/outlets`}>
              <Button variant="outline">
                <Store className="mr-2 h-4 w-4" /> Manage Outlets
              </Button>
            </Link>
            <Link href={`/dashboard/${userRoleForPath}/employees`}>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" /> Employee Management
              </Button>
            </Link>
            <Link href={`/dashboard/${userRoleForPath}/reports/sales`}>
              <Button variant="outline">
                <BarChart className="mr-2 h-4 w-4" /> Sales Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
