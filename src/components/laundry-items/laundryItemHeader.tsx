// src/components/laundry-item/LaundryItemHeader.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface LaundryItemHeaderProps {
  isSuperAdmin: boolean;
  onCreateClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function LaundryItemHeader({
  isSuperAdmin,
  onCreateClick,
  searchQuery,
  setSearchQuery,
}: LaundryItemHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laundry Items</h1>
        <p className="text-muted-foreground mt-1">
          {isSuperAdmin
            ? "Create and manage laundry items for orders"
            : "View available laundry items for orders"}
        </p>
      </div>

      <div className="flex w-full sm:w-auto gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {isSuperAdmin && (
          <Button onClick={onCreateClick} variant={"oren"}>
            <Plus className="mr-2 h-4 w-4" />
            New Item
          </Button>
        )}
      </div>
    </div>
  );
}
