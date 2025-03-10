import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { User, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BypassRequest, WorkerStation } from "@/types/bypass";

interface InfoSectionProps {
  bypassRequest: BypassRequest;
}

export function InfoSection({ bypassRequest }: InfoSectionProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
          <CardDescription>Details of the order associated with this bypass request</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Order ID</p>
              <p className="font-medium">#{bypassRequest.order.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Order Status</p>
              <p className="font-medium">{formatOrderStatus(bypassRequest.order.orderStatus)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Station</p>
              <div>{getStationBadge(bypassRequest.station)}</div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Request Date</p>
              <p className="font-medium">
                {format(new Date(bypassRequest.createdAt), "dd MMMM yyyy HH:mm", { locale: enUS })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Worker Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bypassRequest.worker ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={bypassRequest.worker.user.avatar}
                    alt={bypassRequest.worker.user.fullName}
                  />
                  <AvatarFallback>{bypassRequest.worker.user.fullName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{bypassRequest.worker.user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{bypassRequest.worker.user.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Worker information not available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              Outlet Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bypassRequest.worker?.outlet ? (
              <div>
                <p className="font-medium">{bypassRequest.worker.outlet.outletName}</p>
                <p className="text-sm text-muted-foreground">Outlet ID: {bypassRequest.worker.outlet.id}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Outlet information not available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function getStationBadge(station: WorkerStation) {
  switch (station) {
    case WorkerStation.WASHING:
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Washing
        </Badge>
      );
    case WorkerStation.IRONING:
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          Ironing
        </Badge>
      );
    case WorkerStation.PACKING:
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Packing
        </Badge>
      );
    default:
      return <Badge variant="outline">{station}</Badge>;
  }
}

// // Get badge for status
// function getStatusBadge(status: ByPassStatus | null) {
//   if (status === null) {
//     return (
//       <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
//         Pending
//       </Badge>
//     );
//   } else if (status === ByPassStatus.ACCEPTED) {
//     return (
//       <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
//         Approved
//       </Badge>
//     );
//   } else if (status === ByPassStatus.REJECTED) {
//     return (
//       <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
//         Rejected
//       </Badge>
//     );
//   }
//   return <Badge variant="outline">{status}</Badge>;
// }

// Format the order status from UPPERCASE_WITH_UNDERSCORES to Title Case
function formatOrderStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
