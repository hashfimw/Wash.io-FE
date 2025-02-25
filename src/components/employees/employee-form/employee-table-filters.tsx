// src/components/employees/employee-table-filters.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "@/types/employee";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { useEffect, useState } from "react";
import { Outlet } from "@/types/outlet";

interface EmployeeTableFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRole: Role | "";
  onRoleChange: (role: Role | "") => void;
  selectedOutlet: number | null;
  onOutletChange: (outletId: number | null) => void;
  onResetFilters: () => void;
}

export function EmployeeTableFilters({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedOutlet,
  onOutletChange,
  onResetFilters,
}: EmployeeTableFiltersProps) {
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

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Input
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-[200px] lg:w-[300px]"
        />
      </div>
      <div className="flex flex-row gap-4">
        <Select
          value={selectedRole}
          onValueChange={(value) => onRoleChange(value as Role | "")}
        >
          <SelectTrigger className="w-[140px] lg:w-[200px] ">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL Role">All Roles</SelectItem>
            <SelectItem value={Role.OUTLET_ADMIN}>Outlet Admin</SelectItem>
            <SelectItem value={Role.WORKER}>Worker</SelectItem>
            <SelectItem value={Role.DRIVER}>Driver</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={selectedOutlet?.toString() || ""}
          onValueChange={(value) =>
            onOutletChange(value ? parseInt(value) : null)
          }
        >
          <SelectTrigger className="w-[140px] lg:w-[200px]">
            <SelectValue placeholder="Select outlet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL Outlets">All Outlets</SelectItem>
            {outlets.map((outlet) => (
              <SelectItem key={outlet.id} value={outlet.id.toString()}>
                {outlet.outletName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" onClick={onResetFilters} className="w-[100px]">
        Reset Filters
      </Button>
    </div>
  );
}
