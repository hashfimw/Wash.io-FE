// src/components/admin/bypass-detail/ActionSection.tsx
import { Dispatch, SetStateAction } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BypassRequest } from "@/types/bypass";

interface ActionSectionProps {
  bypassRequest: BypassRequest;
  adminNote: string;
  setAdminNote: Dispatch<SetStateAction<string>>;
  isSubmitting: boolean;
  currentAction: "approve" | "reject" | null;
  onReject: () => void;
  onApprove: () => void;
}

export function ActionSection({
  bypassRequest,
  adminNote,
  setAdminNote,
  isSubmitting,
  currentAction,
  onReject,
  onApprove,
}: ActionSectionProps) {
  return (
    <>
      {/* Bypass Reason Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bypass Request Reason</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{bypassRequest.byPassNote || "No notes provided"}</p>
        </CardContent>
      </Card>

      {/* Admin Response Card - Only shown if request is pending */}
      {bypassRequest.byPassStatus === null && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Response</CardTitle>
            <CardDescription>Provide notes for the worker regarding your decision (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write notes for the worker..."
              className="resize-none"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            {/* Reject Button with Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="oren" disabled={isSubmitting}>
                  {isSubmitting && currentAction === "reject" ? (
                    <span className="mr-2">Rejecting...</span>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Bypass Request?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to reject the bypass request for Order #{bypassRequest.order.id}. The worker
                    will need to complete the missing data before proceeding to the next station.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={onReject}>
                    Reject
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Approve Button with Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="birtu" disabled={isSubmitting}>
                  {isSubmitting && currentAction === "approve" ? (
                    <span className="mr-2">Approving...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Bypass Request?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to approve the bypass request for Order #{bypassRequest.order.id}. The
                    worker will be able to proceed to the next station despite missing data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-birtu hover:bg-birtu/80" onClick={onApprove}>
                    Approve
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
