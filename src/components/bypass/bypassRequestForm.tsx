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
    message: "Bypass reason must be at least 10 characters.",
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
      const response_ = await requestBypass({
        laundryJobId,
        byPassNote: values.byPassNote,
      });

      toast({
        title: "Bypass request submitted",
        description: "Your request has been sent to admin for approval.",
      });

      setRequestSent(true);
      if (onRequestSuccess) {
        onRequestSuccess();
      }
    } catch (error: unknown) {
      console.error("Error submitting bypass request:", error);
      toast({
        variant: "destructive",
        title: "Failed to submit request",
        description: "An error occurred while submitting your bypass request. Please try again.",
      });
    }
  }

  if (requestSent) {
    return (
      <Card className="border-2 border-yellow-300">
        <CardHeader className="bg-yellow-50">
          <CardTitle className="text-yellow-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Bypass Request Pending
          </CardTitle>
          <CardDescription>
            Your bypass request for Order #{orderId} has been submitted and is awaiting admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            You will be notified once the admin responds to your request. If approved, you can proceed to the
            next station.
          </p>
        </CardContent>
      </Card>
    );
  }

  function getStationName(station: WorkerStation): string {
    switch (station) {
      case WorkerStation.WASHING:
        return "washing";
      case WorkerStation.IRONING:
        return "ironing";
      case WorkerStation.PACKING:
        return "packing";
      default:
        return (station as string).toLowerCase();
    }
  }

  return (
    <Card className="border-2 border-red-200">
      <CardHeader className="bg-red-50">
        <CardTitle className="text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Process Blocked
        </CardTitle>
        <CardDescription>
          Please request bypass approval from admin to continue the {getStationName(station)} process for
          Order #{orderId}.
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
                  <FormLabel>Bypass Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why you need to bypass this process (e.g., missing items, weight issues)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information to help admin make a decision.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Request Bypass Approval"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
