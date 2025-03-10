import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role, EmployeeWorkShift, WorkerStation, Employee } from "@/types/employee";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { useEffect, useState } from "react";
import { Outlet } from "@/types/outlet";
import { EmployeeFormValues } from "./schema";

interface EmployeeFormFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
  isEditing?: boolean;
  employee?: Employee;
}

export function EmployeeFormFields({ form, isEditing = false, employee }: EmployeeFormFieldsProps) {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const { getOutlets } = useOutlets();

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const response = await getOutlets();
        setOutlets(response.data);
      } catch (error) {
        console.error("Error fetching outlets:", error);
      }
    };

    fetchOutlets();
  }, []);

  const showStationField = form.watch("role") === Role.WORKER;
  const showWorkShiftField = form.watch("role") !== Role.OUTLET_ADMIN;

  return (
    <div className="grid gap-4">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter full name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} type="email" placeholder="Enter email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {!isEditing && (
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="Enter password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={Role.OUTLET_ADMIN}>Outlet Admin</SelectItem>
                <SelectItem value={Role.WORKER}>Worker</SelectItem>
                <SelectItem value={Role.DRIVER}>Driver</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showWorkShiftField && (
        <FormField
          control={form.control}
          name="workShift"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Shift</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work shift" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={EmployeeWorkShift.MORNING}>Morning</SelectItem>
                  <SelectItem value={EmployeeWorkShift.NOON}>Noon</SelectItem>
                  <SelectItem value={EmployeeWorkShift.NIGHT}>Night</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showStationField && (
        <FormField
          control={form.control}
          name="station"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Station</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={WorkerStation.WASHING}>Washing</SelectItem>
                  <SelectItem value={WorkerStation.IRONING}>Ironing</SelectItem>
                  <SelectItem value={WorkerStation.PACKING}>Packing</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="outletId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isEditing ? "Assign to Outlet" : "Outlet"}</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(parseInt(value))}
              defaultValue={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={isEditing ? "Select outlet to assign" : "Select outlet"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {outlets.map((outlet) => (
                  <SelectItem
                    key={outlet.id}
                    value={outlet.id.toString()}
                    className="flex items-center gap-2"
                  >
                    <span>{outlet.outletName}</span>
                    {isEditing && field.value === outlet.id && (
                      <span className="text-xs text-muted-foreground">(Current)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEditing ? (
              <FormDescription>
                Select which outlet this {employee?.role?.toLowerCase() || "employee"} will be assigned to
              </FormDescription>
            ) : (
              <FormDescription>Select outlet for this employee</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
