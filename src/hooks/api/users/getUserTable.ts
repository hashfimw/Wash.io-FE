import { useEffect, useState } from "react";
import { useUsers } from "./getUser";
import { User, UserSearchParams } from "@/types/user";

export function useUserTable(initialParams: UserSearchParams = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialParams.page || 1);
  const [searchQuery, setSearchQuery] = useState(initialParams.search || "");
  const { getUsers, loading, error } = useUsers();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers({
          page: currentPage,
          limit: initialParams.limit || 5,
          search: searchQuery || undefined,
        });
        setUsers(response.users);
        setTotalPages(response.total_page);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [currentPage, searchQuery, initialParams.limit]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    searchQuery,
    handleSearch,
    handlePageChange,
  };
}
