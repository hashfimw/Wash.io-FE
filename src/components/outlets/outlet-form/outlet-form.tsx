// src/components/outlets/outlet-form/outlet-form.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OutletFormValues, outletFormSchema } from "./schema";
import { OutletFormFields } from "./outlet-form-fields";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { toast } from "@/components/ui/use-toast";
import { Outlet } from "@/types/outlet";

interface OutletFormProps {
  open: boolean;
  onClose: () => void;
  outlet?: Outlet;
  onSuccess?: () => void;
}

export function OutletForm({
  open,
  onClose,
  outlet,
  onSuccess,
}: OutletFormProps) {
  const [loading, setLoading] = useState(false);
  const { createOutlet, updateOutlet } = useOutlets();

  // Create form with empty default values first
  const form = useForm<OutletFormValues>({
    resolver: zodResolver(outletFormSchema),
    defaultValues: {
      outletName: "",
      addressLine: "",
      province: "",
      regency: "",
      district: "",
      village: "",
      latitude: "",
      longitude: "",
    },
  });

  // Set form values when outlet changes or form is opened
  useEffect(() => {
    if (outlet && open) {
      console.log("Setting form values for outlet:", outlet);

      // Use reset instead of defaultValues to update the form when outlet changes
      form.reset({
        outletName: outlet.outletName,
        addressLine: outlet.outletAddress.addressLine,
        province: outlet.outletAddress.province,
        regency: outlet.outletAddress.regency,
        district: outlet.outletAddress.district,
        village: outlet.outletAddress.village,
        latitude: outlet.outletAddress.latitude || "",
        longitude: outlet.outletAddress.longitude || "",
      });
    } else if (!outlet && open) {
      // Reset form when creating a new outlet
      form.reset({
        outletName: "",
        addressLine: "",
        province: "",
        regency: "",
        district: "",
        village: "",
        latitude: "",
        longitude: "",
      });
    }
  }, [outlet, open, form]);

  const onSubmit = async (values: OutletFormValues) => {
    try {
      setLoading(true);
      // Kirim data sesuai format yang diharapkan API
      if (outlet) {
        await updateOutlet(outlet.id, {
          outletName: values.outletName,
          addressLine: values.addressLine,
          province: values.province,
          regency: values.regency,
          district: values.district,
          village: values.village,
          latitude: values.latitude || undefined,
          longitude: values.longitude || undefined,
        });
        toast({ title: "Success", description: "Outlet updated successfully" });
      } else {
        await createOutlet({
          outletName: values.outletName,
          addressLine: values.addressLine,
          province: values.province,
          regency: values.regency,
          district: values.district,
          village: values.village,
          latitude: values.latitude || undefined,
          longitude: values.longitude || undefined,
        });
        toast({ title: "Success", description: "Outlet created successfully" });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save outlet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{outlet ? "Edit Outlet" : "Add New Outlet"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <OutletFormFields form={form} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant={"birtu"}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {outlet ? "Updating..." : "Creating..."}
                  </>
                ) : outlet ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
