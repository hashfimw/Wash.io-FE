// src/components/customers/UserTable.tsx
import { useState, useCallback, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { OutletTablePagination } from "../outlets/outlet-table-pagination";
import { User } from "@/types/user";

interface UserTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearch: (query: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function UserTable({
  users,
  loading,
  error,
  searchQuery,
  onSearch,
  currentPage,
  totalPages,
  onPageChange,
}: UserTableProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Custom debounce hook
  useEffect(() => {
    // Create a timer
    const timerId = setTimeout(() => {
      // Hanya panggil onSearch jika query berubah
      if (localSearchQuery !== searchQuery) {
        onSearch(localSearchQuery);
      }
    }, 600);

    // Cleanup function untuk membersihkan timer
    return () => {
      clearTimeout(timerId);
    };
  }, [localSearchQuery, onSearch, searchQuery]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    // Update local state secara langsung
    setLocalSearchQuery(query);
  };

  // Render loading state
  if (loading) return <TableSkeleton columns={5} rows={5} />;

  // Render error state
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  // Render empty state
  const isEmptyUsers = users.length === 0;

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={localSearchQuery}
        onChange={handleSearchChange}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table className="justify-center item">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Join Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmptyUsers ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {localSearchQuery
                    ? "No users found matching your search."
                    : "No users available."}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.fullName || "N/A"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isVerified ? "default" : "destructive"}
                    >
                      {user.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Add action buttons if needed */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - only show if there are users */}
      {!isEmptyUsers && (
        <div className="flex justify-end">
          <OutletTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
