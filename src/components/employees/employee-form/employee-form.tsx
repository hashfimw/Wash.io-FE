// src/components/employees/employee-form/EmployeeForm.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeFormSchema, EmployeeFormValues } from "./schema";
import { EmployeeFormFields } from "./employee-form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEmployees } from "@/hooks/api/employees/useEmployee";
import { useToast } from "@/components/ui/use-toast";
import {
  CreateEmployeeInput,
  Employee,
  EmployeeWorkShift,
  Role,
  UpdateEmployeeInput,
  WorkerStation,
} from "@/types/employee";

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee;
  onSuccess?: () => void;
}

export function EmployeeForm({
  open,
  onClose,
  employee,
  onSuccess,
}: EmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const { createEmployee, updateEmployee } = useEmployees();
  const { toast } = useToast();

  const defaultValues: EmployeeFormValues = employee
    ? {
        fullName: employee.fullName || "",
        email: employee.email || "",
        role: employee.role as Role, // Cast ke Role enum
        workShift:
          (employee.Employee?.workShift as EmployeeWorkShift) || undefined,
        station: (employee.Employee?.station as WorkerStation) || undefined,
        outletId: employee.Employee?.outlet?.id || 0,
      }
    : {
        fullName: "",
        email: "",
        password: "", // Password hanya untuk create
        role: Role.WORKER, // Default role
        workShift: undefined,
        station: undefined,
        outletId: 0,
      };

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
  });

  // Reset form ketika employee berubah
  useEffect(() => {
    if (employee) {
      form.reset({
        fullName: employee.fullName || "",
        email: employee.email || "",
        role: employee.role as Role,
        workShift:
          (employee.Employee?.workShift as EmployeeWorkShift) || undefined,
        station: (employee.Employee?.station as WorkerStation) || undefined,
        outletId: employee.Employee?.outlet?.id || 0,
      });
    } else {
      form.reset({
        fullName: "",
        email: "",
        password: "",
        role: Role.WORKER,
        workShift: undefined,
        station: undefined,
        outletId: 0,
      });
    }
  }, [employee, form]);

  // src/components/employees/employee-form/EmployeeForm.tsx
  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      setLoading(true);
      if (employee) {
        // Untuk update, kita hanya kirim field yang ada
        const updateData: UpdateEmployeeInput = {
          fullName: values.fullName,
          email: values.email,
          workShift: values.workShift,
          station: values.station,
          outletId: values.outletId,
        };
        await updateEmployee(employee.id, updateData);
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      } else {
        // Untuk create, pastikan password ada
        if (!values.password) {
          toast({
            title: "Error",
            description: "Password is required for new employee",
            variant: "destructive",
          });
          return;
        }

        const createData: CreateEmployeeInput = {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          role: values.role,
          workShift: values.workShift,
          station: values.station,
          outletId: values.outletId,
        };

        await createEmployee(createData);
        toast({
          title: "Success",
          description: "Employee created successfully",
        });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save employee",
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
          <DialogTitle>
            {employee?.id ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <EmployeeFormFields form={form} isEditing={!!employee} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {employee ? "Updating..." : "Creating..."}
                  </>
                ) : employee ? (
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
