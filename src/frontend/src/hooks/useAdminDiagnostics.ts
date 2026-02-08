import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export interface AdminDiagnostics {
  callerPrincipal: string;
  isAdmin: boolean;
  userRole: string;
  hasUserPermission: boolean;
  hasAdminPermission: boolean;
  totalAdmins: bigint;
  totalUsers: bigint;
}

export function useAdminDiagnostics() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdminDiagnostics>({
    queryKey: ['adminDiagnostics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminDiagnostics();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
