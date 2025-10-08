import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../auth/useAuth';

/**
 * Hook to fetch the full current user object from the API
 * Returns the complete user object with all fields needed for UserLookup
 */
export const useCurrentUser = () => {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/users/me/');
      return response.data;
    },
    enabled: !!authUser, // Only fetch if user is authenticated
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
