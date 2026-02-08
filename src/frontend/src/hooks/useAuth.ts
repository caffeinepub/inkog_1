import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';
import { useQuery } from '@tanstack/react-query';
import { StaffAccount } from '../backend';

export function useAuth() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const isAdminQuery = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
  });

  const staffAccountQuery = useQuery<StaffAccount | null>({
    queryKey: ['myStaffAccount'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyStaffAccount();
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
  });

  const isAuthenticated = !!identity;
  const isAdmin = isAdminQuery.data === true;
  const isStaff = !!staffAccountQuery.data;
  
  // Role-specific loading states
  const isAdminLoading = actorFetching || (isAuthenticated && isAdminQuery.isLoading);
  const isStaffLoading = actorFetching || (isAuthenticated && staffAccountQuery.isLoading);
  
  // General loading (for backward compatibility, but prefer role-specific)
  const isLoading = actorFetching || 
    (isAuthenticated && (isAdminQuery.isLoading || staffAccountQuery.isLoading));

  // Get principal string for diagnostics
  const principalString = identity?.getPrincipal().toString() || null;

  return {
    isAuthenticated,
    isAdmin,
    isStaff,
    isLoading,
    // Role-specific loading states
    isAdminLoading,
    isStaffLoading,
    staffAccount: staffAccountQuery.data,
    // Expose error states and retry functions
    adminError: isAdminQuery.error,
    staffError: staffAccountQuery.error,
    retryAdminCheck: isAdminQuery.refetch,
    retryStaffCheck: staffAccountQuery.refetch,
    hasAdminError: !!isAdminQuery.error,
    hasStaffError: !!staffAccountQuery.error,
    // Expose whether queries have completed
    adminCheckComplete: isAdminQuery.isFetched,
    staffCheckComplete: staffAccountQuery.isFetched,
    // Diagnostics data
    principalString,
    adminCheckResult: isAdminQuery.data,
    staffAccountPresent: !!staffAccountQuery.data,
  };
}
