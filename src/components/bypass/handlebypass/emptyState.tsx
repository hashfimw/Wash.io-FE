import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  searchQuery: string;
}

export function EmptyState({ searchQuery }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 rounded-full bg-blue-50 p-3">
        <AlertCircle className="h-6 w-6 text-blue-500" />
      </div>
      <h3 className="mb-2 text-xl font-medium">No Bypass Requests</h3>
      <p className="text-center text-muted-foreground">
        {searchQuery
          ? "No results match your search criteria."
          : "There are no bypass requests that need your attention."}
      </p>
    </div>
  );
}
