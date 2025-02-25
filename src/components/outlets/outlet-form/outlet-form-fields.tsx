// src/components/outlets/outlet-form/outlet-form-fields.tsx
import { UseFormReturn } from "react-hook-form";
import { OutletFormValues } from "./schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LocationSection } from "./location-section";

interface OutletFormFieldsProps {
  form: UseFormReturn<OutletFormValues>;
}

export function OutletFormFields({ form }: OutletFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Outlet Name Field */}
      <FormField
        control={form.control}
        name="outletName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Outlet Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter outlet name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Location and Address Fields */}
      <LocationSection form={form} />
    </div>
  );
}
