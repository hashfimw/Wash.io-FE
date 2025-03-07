"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Calendar } from "lucide-react";

interface PendingOrdersCardProps {
  count: number;
  userRoleForPath: string;
}

export function PendingOrdersCard({
  count,
  userRoleForPath,
}: PendingOrdersCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/${userRoleForPath}/orders/process`);
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          Pending Orders
        </CardTitle>
        <Shirt className="h-6 w-6 text-orange-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        {count > 0 && (
          <p className="text-xs text-yellow-600">Requires attention</p>
        )}
      </CardContent>
    </Card>
  );
}

interface TodayOrdersCardProps {
  count: number;
  userRoleForPath: string;
}

export function TodayOrdersCard({
  count,
  userRoleForPath,
}: TodayOrdersCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/${userRoleForPath}/orders`);
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          Today's Orders
        </CardTitle>
        <Calendar className="h-6 w-6 text-purple-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-gray-600">Scheduled today</p>
      </CardContent>
    </Card>
  );
}
