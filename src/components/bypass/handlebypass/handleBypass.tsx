// src/components/admin/BypassRequestDetail.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { BypassRequest } from "@/types/bypass";
import { useBypassRequest } from "@/hooks/api/bypassrequest/useBypass";
import { InfoSection } from "./InfoSection";
import { ActionSection } from "./ActionAction";

interface BypassRequestDetailProps {
  bypassRequest: BypassRequest;
  onProcessed?: () => void;
}

export function BypassRequestDetail({ bypassRequest, onProcessed }: BypassRequestDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { handleBypassRequest } = useBypassRequest();

  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAction, setCurrentAction] = useState<"approve" | "reject" | null>(null);

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
        title: decision === "approve" ? "Bypass request approved" : "Bypass request rejected",
        description: `You have ${
          decision === "approve" ? "approved" : "rejected"
        } the bypass request for Order #${bypassRequest.order.id}.`,
      });

      // Refresh data
      if (onProcessed) {
        onProcessed();
      } else {
        router.push("/dashboard/bypass-requests");
        router.refresh();
      }
    } catch (error: unknown) {
      console.error(`Error ${decision === "approve" ? "approving" : "rejecting"} bypass request:`, error);
      toast({
        variant: "destructive",
        title: `Failed to ${decision === "approve" ? "approve" : "reject"} request`,
        description:
          (error instanceof Error && error.message) ||
          `An error occurred while ${
            decision === "approve" ? "approving" : "rejecting"
          } the bypass request. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
      setCurrentAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <InfoSection bypassRequest={bypassRequest} />

      <ActionSection
        bypassRequest={bypassRequest}
        adminNote={adminNote}
        setAdminNote={setAdminNote}
        isSubmitting={isSubmitting}
        currentAction={currentAction}
        onReject={() => handleProcessRequest("reject")}
        onApprove={() => handleProcessRequest("approve")}
      />
    </div>
  );
}
