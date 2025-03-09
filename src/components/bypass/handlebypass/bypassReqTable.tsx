// src/components/bypass/BypassRequestsTable.tsx
import { BypassRequest } from "@/types/bypass";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { CustomBadge } from "./badgeStatus";
import SwipeIndicator from "@/components/swipeIndicator";

interface BypassRequestsTableProps {
  requests: BypassRequest[];
  role: string;
}

export function BypassRequestsTable({
  requests,
  role,
}: BypassRequestsTableProps) {
  return (
    <div className="rounded-md border">
      <SwipeIndicator className="md:hidden" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Worker</TableHead>
            <TableHead>Station</TableHead>
            <TableHead>Outlet</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">#{request.id}</TableCell>
              <TableCell>#{request.order.id}</TableCell>
              <TableCell>
                {request.worker ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={request.worker.user.avatar}
                        alt={request.worker.user.fullName}
                      />
                      <AvatarFallback>
                        {request.worker.user.fullName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[120px]">
                      {request.worker.user.fullName}
                    </span>
                  </div>
                ) : (
                  <span>-</span>
                )}
              </TableCell>
              <TableCell>
                <CustomBadge type="station" value={request.station} />
              </TableCell>
              <TableCell>{request.worker?.outlet?.outletName || "-"}</TableCell>
              <TableCell>
                <CustomBadge type="status" value={request.byPassStatus} />
              </TableCell>
              <TableCell>
                {format(new Date(request.createdAt), "dd MMM yyyy HH:mm", {
                  locale: enUS,
                })}
              </TableCell>
              <TableCell className="text-right">
                {request.byPassStatus === null ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/${role}/bypass/${request.id}`}>
                      Review
                    </Link>
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/${role}/bypass/${request.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
