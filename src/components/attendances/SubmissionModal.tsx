"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface SubmissionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function SubmissionModal({ open, onClose, onSubmit, loading }: SubmissionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Attendance</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit attendance? Once you submitted you cannot clock in/clock out again in your current shift.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading} variant="birtu">
            Submit Attendance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
