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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBypassRequest } from "@/hooks/api/bypassrequest/useBypass";
import { WorkerStation } from "@/types/bypass";

const bypassFormSchema = z.object({
  byPassNote: z.string().min(10, {
    message: "Bypass note/reason is at least 10 characters.",
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
      const _response = await requestBypass({
        laundryJobId,
        byPassNote: values.byPassNote,
      });

      toast({
        title: "Bypass request sent",
        description: "Your request has been sent to admin to be confirmed.",
      });

      setRequestSent(true);
      if (onRequestSuccess) {
        onRequestSuccess();
      }
    } catch (error: any) {
      console.error("Error mengajukan permintaan bypass:", error);
      toast({
        variant: "destructive",
        title: "Failed to send request",
        description:
          error.response?.data?.message || "Something wrong during request bypass process. Please try again.",
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
            Permintaan bypass Anda untuk Order #{orderId} telah dikirim dan sedang menunggu persetujuan admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Anda akan diberi tahu begitu admin merespon permintaan Anda. Jika disetujui, Anda dapat
            melanjutkan ke stasiun berikutnya.
          </p>
        </CardContent>
      </Card>
    );
  }

  function getStationName(station: WorkerStation): import("react").ReactNode {
    return station.toLowerCase().replace(/(?: |\b)(\w)/g, function (key) {
      return key.toUpperCase();
    });
  }

  return (
    //   <Card className="border-2 border-red-200">
    //     <CardHeader className="bg-red-50">
    //       <CardTitle className="text-red-700 flex items-center gap-2">
    //         <AlertCircle className="h-5 w-5" />
    //         Proses Terblokir
    //       </CardTitle>
    //       <CardDescription>
    //         Silakan minta persetujuan bypass dari admin untuk melanjutkan proses{" "}
    //         {getStationName(station)} untuk Order #{orderId}.
    //       </CardDescription>
    //     </CardHeader>
    //     <CardContent className="pt-6">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="byPassNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bypass reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain why you need to request bypass (eg. missing item(s), force majeur, etc.)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Give detailed information to help the decision of admin.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="birtu" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Request bypass"}
        </Button>
      </form>
    </Form>
    //   </CardContent>
    // </Card>
  );
}
