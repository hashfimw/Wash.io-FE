// src/components/laundry/BypassRequestForm.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBypassRequest } from "@/hooks/api/bypassrequest/useBypass";
import { WorkerStation } from "@/types/bypass";

// Skema validasi untuk form bypass
const bypassFormSchema = z.object({
  byPassNote: z.string().min(10, {
    message: "Alasan bypass minimal 10 karakter.",
  }),
});

type BypassFormValues = z.infer<typeof bypassFormSchema>;

interface BypassRequestFormProps {
  laundryJobId: number;
  station: WorkerStation;
  orderId: number;
  onRequestSuccess?: () => void;
}

export function BypassRequestForm({
  laundryJobId,
  station,
  orderId,
  onRequestSuccess,
}: BypassRequestFormProps) {
  const { requestBypass, loading } = useBypassRequest();
  const [requestSent, setRequestSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<BypassFormValues>({
    resolver: zodResolver(bypassFormSchema),
    defaultValues: {
      byPassNote: "",
    },
  });

  async function onSubmit(values: BypassFormValues) {
    try {
      const response = await requestBypass({
        laundryJobId,
        byPassNote: values.byPassNote,
      });

      toast({
        title: "Permintaan bypass terkirim",
        description:
          "Permintaan Anda telah dikirim ke admin untuk persetujuan.",
      });

      setRequestSent(true);
      if (onRequestSuccess) {
        onRequestSuccess();
      }
    } catch (error: any) {
      console.error("Error mengajukan permintaan bypass:", error);
      toast({
        variant: "destructive",
        title: "Gagal mengirim permintaan",
        description:
          error.response?.data?.message ||
          "Terjadi kesalahan saat mengajukan permintaan bypass. Silakan coba lagi.",
      });
    }
  }

  if (requestSent) {
    return (
      <Card className="border-2 border-yellow-300">
        <CardHeader className="bg-yellow-50">
          <CardTitle className="text-yellow-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Permintaan Bypass Menunggu
          </CardTitle>
          <CardDescription>
            Permintaan bypass Anda untuk Order #{orderId} telah dikirim dan
            sedang menunggu persetujuan admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Anda akan diberi tahu begitu admin merespon permintaan Anda. Jika
            disetujui, Anda dapat melanjutkan ke stasiun berikutnya.
          </p>
        </CardContent>
      </Card>
    );
  }

  function getStationName(station: WorkerStation): import("react").ReactNode {
    throw new Error("Function not implemented.");
  }

  return (
    <Card className="border-2 border-red-200">
      <CardHeader className="bg-red-50">
        <CardTitle className="text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Proses Terblokir
        </CardTitle>
        <CardDescription>
          Silakan minta persetujuan bypass dari admin untuk melanjutkan proses{" "}
          {getStationName(station)} untuk Order #{orderId}.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="byPassNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan Bypass</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan mengapa Anda perlu bypass proses ini (mis. item hilang, masalah berat)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Berikan informasi detail untuk membantu admin membuat
                    keputusan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Mengirim..." : "Ajukan Persetujuan Bypass"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
