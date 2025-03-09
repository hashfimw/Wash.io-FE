// src/components/customers/UserTable.tsx
import { useState, useCallback, useEffect, useMemo } from "react";
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
import { TablePagination } from "../shared/usePagination";
import { User } from "@/types/user";
import SwipeIndicator from "../swipeIndicator";

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

  // Sync local search with prop when props change
  useEffect(() => {
    if (searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  // Debounced search effect
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        onSearch(localSearchQuery);
      }
    }, 600);

    return () => {
      clearTimeout(timerId);
    };
  }, [localSearchQuery, onSearch, searchQuery]);

  // Handle search input change with useCallback
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearchQuery(e.target.value);
    },
    []
  );

  // Memoize empty state message
  const emptyStateMessage = useMemo(() => {
    return localSearchQuery
      ? "No users found matching your search."
      : "No users available.";
  }, [localSearchQuery]);

  // Memoize user rows to prevent re-renders
  const userRows = useMemo(() => {
    if (!users || users.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            {emptyStateMessage}
          </TableCell>
        </TableRow>
      );
    }

    return users.map((user) => (
      <TableRow key={user.id}>
        <TableCell className="font-medium">{user.fullName || "N/A"}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          <Badge variant={user.isVerified ? "badgebirtu" : "badgeoren"}>
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
    ));
  }, [users, emptyStateMessage]);

  // Memoize the search input component
  const searchInput = useMemo(
    () => (
      <Input
        placeholder="Search users..."
        value={localSearchQuery}
        onChange={handleSearchChange}
        className="max-w-sm"
      />
    ),
    [localSearchQuery, handleSearchChange]
  );

  if (loading) return <TableSkeleton columns={5} rows={5} />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const isEmptyUsers = !users || users.length === 0;

  return (
    <div className="space-y-4">
      {searchInput}

      <div className="rounded-md border">
        <SwipeIndicator className="md:hidden" />
        <Table className="justify-center item">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Join Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{userRows}</TableBody>
        </Table>
      </div>

      {/* Pagination - only show if there are users */}
      {!isEmptyUsers && (
        <div className="flex justify-end">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
