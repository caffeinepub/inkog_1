import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { School } from '../backend';

export function useGetSchools() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSchools();
    },
    enabled: !!actor && !actorFetching,
  });
}
