// src/app/dashboard/(admin)/bypass-requests/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useBypassRequest } from "@/hooks/api/bypassrequest/useBypass";
import { BypassRequest, ByPassStatus } from "@/types/bypass";
import { BypassRequestDetail } from "@/components/bypass/handleBypass";

export default function BypassRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { getBypassRequestById, loading } = useBypassRequest();

  const [bypassRequest, setBypassRequest] = useState<BypassRequest | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const fetchBypassRequest = async () => {
      try {
        setIsLoading(true);
        // Token akan ditangani oleh interceptor axios
        const result = await getBypassRequestById(Number(id));
        setBypassRequest(result.data);
      } catch (err) {
        console.error(`Error fetching bypass request with id ${id}:`, err);
        setError("Gagal memuat detail permintaan bypass");
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Gagal memuat detail permintaan bypass. Silakan coba lagi.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBypassRequest();
    }
  }, [id]);

  // Mendapatkan badge untuk status
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/outlet-admin/bypass">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detail Permintaan Bypass</h1>
        </div>

        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !bypassRequest) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/bypass-requests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detail Permintaan Bypass</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">
              Permintaan Tidak Ditemukan
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              {error ||
                `Permintaan bypass dengan ID #${id} tidak dapat ditemukan atau telah dihapus.`}
            </p>
            <Button asChild>
              <Link href="/dashboard/bypass-requests">Kembali ke Daftar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/bypass-requests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          Detail Permintaan Bypass #{bypassRequest.id}
        </h1>
        <div className="ml-2">{getStatusBadge(bypassRequest.byPassStatus)}</div>
      </div>

      <BypassRequestDetail
        bypassRequest={bypassRequest}
        onProcessed={() => {
          router.push("/dashboard/bypass-requests");
          router.refresh();
        }}
      />
    </div>
  );
}
