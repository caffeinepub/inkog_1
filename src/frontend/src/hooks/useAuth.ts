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
  const isLoading = actorFetching || isAdminQuery.isLoading || staffAccountQuery.isLoading;

  return {
    isAuthenticated,
    isAdmin,
    isStaff,
    isLoading,
    staffAccount: staffAccountQuery.data,
  };
}
