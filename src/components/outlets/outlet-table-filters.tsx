import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface OutletTableFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
}

export function OutletTableFilters({ searchQuery, onSearchChange, onResetFilters }: OutletTableFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search outlets..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      {searchQuery && (
        <Button variant="ghost" onClick={onResetFilters} size="icon">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
