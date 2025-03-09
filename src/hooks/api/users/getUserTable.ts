// src/hooks/api/customers/useUserTable.ts
import { useEffect, useState, useCallback, useRef } from "react";

import { User, UserSearchParams } from "@/types/user";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "./getUser";

export function useUserTable(initialParams: UserSearchParams = {}) {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialParams.page || 1);
  const [searchQuery, setSearchQuery] = useState(initialParams.search || "");
  const [isLoading, setIsLoading] = useState(true);

  // Refs for optimization
  const isMounted = useRef(false);
  const lastFetchParamsRef = useRef<string | null>(null);

  // Hooks
  const { getUsers, loading: apiLoading, error } = useUsers();
  const debouncedSearch = useDebounce(searchQuery, 600);

  // Combined loading state
  const loading = isLoading || apiLoading;

  // Effect to mark component as mounted
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch users function
  const fetchUsers = useCallback(async () => {
    // Create params key for tracking
    const paramsKey = JSON.stringify({
      page: currentPage,
      limit: initialParams.limit || 5,
      search: debouncedSearch || undefined,
    });

    // Skip if params are the same and we already have data
    if (lastFetchParamsRef.current === paramsKey && users.length > 0) {
      console.log("Using cached user data");
      setIsLoading(false);
      return;
    }

    lastFetchParamsRef.current = paramsKey;
    setIsLoading(true);

    try {
      console.log("Fetching users with params:", {
        page: currentPage,
        limit: initialParams.limit || 5,
        search: debouncedSearch || undefined,
      });

      const response = await getUsers({
        page: currentPage,
        limit: initialParams.limit || 5,
        search: debouncedSearch || undefined,
      });

      if (isMounted.current) {
        setUsers(response.users || []);
        setTotalPages(response.total_page || 0);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [
    currentPage,
    debouncedSearch,
    getUsers,
    initialParams.limit,
    users.length,
  ]);

  // Effect to fetch users when params change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [currentPage, debouncedSearch, fetchUsers]);

  // Handler for search with useCallback
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handler for page change with useCallback
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Refresh function
  const refresh = useCallback(() => {
    lastFetchParamsRef.current = null; // Invalidate params cache
    setIsLoading(true);

    setTimeout(() => {
      fetchUsers();
    }, 100);
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    searchQuery,
    handleSearch,
    handlePageChange,
    refresh,
  };
}
