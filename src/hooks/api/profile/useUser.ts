import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiResponse, User } from '@/types/profile';
import { toast } from '@/components/ui/use-toast';

const API_URL =  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useUser = (userId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = async (): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user data');
      }

      const responseData: ApiResponse<User> = await response.json();
      return responseData.data as User;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Updated Failed",
        description: `${errorMessage}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return useQuery({
    queryKey: ['user', userId],
    queryFn: fetchUser,
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
};