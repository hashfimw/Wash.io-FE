// src/components/employees/employee-form/employee-table-filters.tsx
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
import { Search, X } from "lucide-react";

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
  const { getOutlets, loading: outletsLoading } = useOutlets();

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const response = await getOutlets();
        setOutlets(response.data || []);
      } catch (error) {
        console.error("Error fetching outlets:", error);
      }
    };

    fetchOutlets();
  }, []);

  const handleRoleChange = (value: string) => {
    // Handle "ALL Role" selection as empty string
    if (value === "ALL Role") {
      onRoleChange("");
    } else {
      onRoleChange(value as Role);
    }
  };

  const handleOutletChange = (value: string) => {
    // Handle "ALL Outlets" selection as null
    if (value === "ALL Outlets") {
      onOutletChange(null);
    } else {
      onOutletChange(value ? parseInt(value) : null);
    }
  };

  const clearSearch = () => {
    onSearchChange("");
  };

  const isFiltersActive = searchQuery || selectedRole || selectedOutlet;

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full md:w-[300px] pl-8 pr-8"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-2.5"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Selects */}
      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        {/* Role Filter */}
        <Select
          value={selectedRole || "ALL Role"}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL Role">All Roles</SelectItem>
            <SelectItem value={Role.OUTLET_ADMIN}>Outlet Admin</SelectItem>
            <SelectItem value={Role.WORKER}>Worker</SelectItem>
            <SelectItem value={Role.DRIVER}>Driver</SelectItem>
          </SelectContent>
        </Select>

        {/* Outlet Filter */}
        <Select
          value={selectedOutlet?.toString() || "ALL Outlets"}
          onValueChange={handleOutletChange}
          disabled={outletsLoading}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
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

      {/* Reset Button */}
      <Button
        variant="birtu"
        onClick={onResetFilters}
        className="w-full md:w-auto"
        disabled={!isFiltersActive}
      >
        Reset Filters
      </Button>
    </div>
  );
}
