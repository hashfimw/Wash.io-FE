// src/components/admin/BypassRequestDetail.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, User, Calendar, Home, Box } from "lucide-react";
import { useBypassRequest } from "@/hooks/api/bypassrequest/useBypass";
import { BypassRequest, ByPassStatus, WorkerStation } from "@/types/bypass";

interface BypassRequestDetailProps {
  bypassRequest: BypassRequest;
  onProcessed?: () => void;
}

export function BypassRequestDetail({
  bypassRequest,
  onProcessed,
}: BypassRequestDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { handleBypassRequest, loading } = useBypassRequest();

  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    "approve" | "reject" | null
  >(null);

  const handleProcessRequest = async (decision: "approve" | "reject") => {
    setCurrentAction(decision);
    setIsSubmitting(true);

    try {
      await handleBypassRequest({
        laundryJobId: bypassRequest.id,
        isApproved: decision === "approve",
        adminNote: adminNote.trim() ? adminNote : undefined,
      });

      toast({
        title:
          decision === "approve"
            ? "Permintaan bypass disetujui"
            : "Permintaan bypass ditolak",
        description: `Anda telah ${
          decision === "approve" ? "menyetujui" : "menolak"
        } permintaan bypass untuk Order #${bypassRequest.order.id}.`,
      });

      // Segarkan data
      if (onProcessed) {
        onProcessed();
      } else {
        router.push("/dashboard/bypass-requests");
        router.refresh();
      }
    } catch (error: any) {
      console.error(
        `Error ${
          decision === "approve" ? "menyetujui" : "menolak"
        } permintaan bypass:`,
        error
      );
      toast({
        variant: "destructive",
        title: `Gagal ${
          decision === "approve" ? "menyetujui" : "menolak"
        } permintaan`,
        description:
          error.response?.data?.message ||
          `Terjadi kesalahan saat ${
            decision === "approve" ? "menyetujui" : "menolak"
          } permintaan bypass. Silakan coba lagi.`,
      });
    } finally {
      setIsSubmitting(false);
      setCurrentAction(null);
    }
  };

  // Mendapatkan badge untuk stasiun
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Order</CardTitle>
          <CardDescription>
            Detail order yang terkait dengan permintaan bypass ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                ID Order
              </p>
              <p className="font-medium">#{bypassRequest.order.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Status Order
              </p>
              <p className="font-medium">{bypassRequest.order.orderStatus}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Stasiun
              </p>
              <div>{getStationBadge(bypassRequest.station)}</div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Tanggal Permintaan
              </p>
              <p className="font-medium">
                {format(
                  new Date(bypassRequest.createdAt),
                  "dd MMMM yyyy HH:mm",
                  { locale: idLocale }
                )}
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
              Informasi Worker
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
                  <AvatarFallback>
                    {bypassRequest.worker.user.fullName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {bypassRequest.worker.user.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bypassRequest.worker.user.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Informasi worker tidak tersedia
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              Informasi Outlet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bypassRequest.worker?.outlet ? (
              <div>
                <p className="font-medium">
                  {bypassRequest.worker.outlet.outletName}
                </p>
                <p className="text-sm text-muted-foreground">
                  ID Outlet: {bypassRequest.worker.outlet.id}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Informasi outlet tidak tersedia
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alasan Permintaan Bypass</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">
            {bypassRequest.byPassNote || "Tidak ada catatan yang diberikan"}
          </p>
        </CardContent>
      </Card>

      {bypassRequest.byPassStatus === null && (
        <Card>
          <CardHeader>
            <CardTitle>Tanggapan Admin</CardTitle>
            <CardDescription>
              Berikan catatan untuk worker mengenai keputusan Anda (opsional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Tulis catatan untuk worker..."
              className="resize-none"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isSubmitting}>
                  {isSubmitting && currentAction === "reject" ? (
                    <>
                      <span className="mr-2">Menolak...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Tolak
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tolak Permintaan Bypass?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda akan menolak permintaan bypass untuk Order #
                    {bypassRequest.order.id}. Worker harus melengkapi data yang
                    kurang sebelum dapat melanjutkan ke stasiun berikutnya.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleProcessRequest("reject")}
                  >
                    Tolak
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default" disabled={isSubmitting}>
                  {isSubmitting && currentAction === "approve" ? (
                    <>
                      <span className="mr-2">Menyetujui...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Setujui
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Setujui Permintaan Bypass?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda akan menyetujui permintaan bypass untuk Order #
                    {bypassRequest.order.id}. Worker akan dapat melanjutkan ke
                    stasiun berikutnya meskipun ada data yang kurang.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleProcessRequest("approve")}
                  >
                    Setujui
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
