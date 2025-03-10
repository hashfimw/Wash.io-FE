import * as z from "zod";
import { Role, EmployeeWorkShift, WorkerStation } from "@/types/employee";

export const employeeFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.nativeEnum(Role, {
    required_error: "Role is required",
  }),
  workShift: z.nativeEnum(EmployeeWorkShift).optional(),
  station: z.nativeEnum(WorkerStation).optional(),
  outletId: z.number({
    required_error: "Outlet is required",
  }),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
