import { UseFormReturn, useWatch } from "react-hook-form";
import { OutletFormValues } from "./schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { SearchableAddress } from "@/components/address/SearchableAddress";
import { useEffect } from "react";

const LocationPicker = dynamic(
  () => import("@/components/map/locationPicker").then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full flex items-center justify-center border rounded-md">
        Loading map...
      </div>
    ),
  }
);

interface LocationSectionProps {
  form: UseFormReturn<OutletFormValues>;
}

export function LocationSection({ form }: LocationSectionProps) {
  const latitude = useWatch({ control: form.control, name: "latitude" });
  const longitude = useWatch({ control: form.control, name: "longitude" });

  useEffect(() => {
    console.log("Current form values:", form.getValues());
  }, [form]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="addressLine"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Full address" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Select Location</FormLabel>
        <LocationPicker form={form} latitude={latitude} longitude={longitude} />
      </div>

      <SearchableAddress form={form} />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Province" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="regency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Regency</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Regency" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <FormControl>
                <Input {...field} placeholder="District" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="village"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Village</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Village" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
