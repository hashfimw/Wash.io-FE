// src/app/dashboard/(admin)/bypass-requests/page.tsx
"use client";

import { useEffect, useState } from "react";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { AlertCircle, MoreHorizontal, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { BypassRequest, ByPassStatus, WorkerStation } from "@/types/bypass";
import { useBypassRequest } from "@/hooks/api/bypassrequest/useBypass";

// Fungsi untuk mendapatkan badge status
const getStatusBadge = (status: ByPassStatus | null) => {
  if (status === null) {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-700 border-yellow-200"
      >
        Menunggu
      </Badge>
    );
  } else if (status === ByPassStatus.ACCEPTED) {
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        Disetujui
      </Badge>
    );
  } else if (status === ByPassStatus.REJECTED) {
    return (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200"
      >
        Ditolak
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
};

// Fungsi untuk mendapatkan badge stasiun
const getStationBadge = (station: WorkerStation) => {
  switch (station) {
    case WorkerStation.WASHING:
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Pencucian
        </Badge>
      );
    case WorkerStation.IRONING:
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200"
        >
          Penyetrikaan
        </Badge>
      );
    case WorkerStation.PACKING:
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Pengemasan
        </Badge>
      );
    default:
      return <Badge variant="outline">{station}</Badge>;
  }
};

export default function BypassRequestsPage() {
  const {
    getBypassRequests,
    loading: apiLoading,
    error: apiError,
  } = useBypassRequest();
  const [bypassRequests, setBypassRequests] = useState<BypassRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BypassRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchBypassRequests = async () => {
      try {
        setIsLoading(true);
        // Tidak perlu memeriksa sesi, token akan ditangani oleh interceptor axios
        const result = await getBypassRequests();
        setBypassRequests(result.bypassRequests || []);
        setFilteredRequests(result.bypassRequests || []);
      } catch (err) {
        console.error("Error fetching bypass requests:", err);
        setError("Gagal memuat permintaan bypass. Silakan coba lagi.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat permintaan bypass. Silakan coba lagi.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBypassRequests();
  }, []); // Tidak ada ketergantungan pada session

  // Filter berdasarkan pencarian
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRequests(bypassRequests);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = bypassRequests.filter(
        (request) =>
          request.id.toString().includes(lowerQuery) ||
          request.order.id.toString().includes(lowerQuery) ||
          request.worker?.user.fullName.toLowerCase().includes(lowerQuery) ||
          request.worker?.outlet.outletName.toLowerCase().includes(lowerQuery)
      );
      setFilteredRequests(filtered);
    }
  }, [searchQuery, bypassRequests]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Permintaan Bypass
          </h1>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || apiError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || apiError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Permintaan Bypass</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Permintaan Bypass</CardTitle>
          <CardDescription>
            Kelola permintaan bypass dari para worker pada proses laundry
          </CardDescription>
          <div className="flex items-center py-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari permintaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 rounded-full bg-blue-50 p-3">
                <AlertCircle className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="mb-2 text-xl font-medium">
                Tidak Ada Permintaan Bypass
              </h3>
              <p className="text-center text-muted-foreground">
                {searchQuery
                  ? "Tidak ada hasil yang cocok dengan pencarian Anda."
                  : "Tidak ada permintaan bypass yang perlu perhatian Anda."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Stasiun</TableHead>
                    <TableHead>Outlet</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Permintaan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        #{request.id}
                      </TableCell>
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
                      <TableCell>{getStationBadge(request.station)}</TableCell>
                      <TableCell>
                        {request.worker?.outlet?.outletName || "-"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.byPassStatus)}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(request.createdAt),
                          "dd MMM yyyy HH:mm",
                          { locale: idLocale }
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.byPassStatus === null ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/outlet-admin/bypass/${request.id}`}>
                              Tinjau
                            </Link>
                          </Button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/bypass-requests/${request.id}`}
                                >
                                  Lihat Detail
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
