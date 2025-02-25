import * as z from "zod";

export const outletFormSchema = z.object({
  outletName: z.string().min(1, "Outlet name is required"),
  addressLine: z.string().min(1, "Address is required"),
  province: z.string().min(1, "Province is required"),
  regency: z.string().min(1, "Regency is required"),
  district: z.string().min(1, "District is required"),
  village: z.string().min(1, "Village is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export type OutletFormValues = z.infer<typeof outletFormSchema>;
