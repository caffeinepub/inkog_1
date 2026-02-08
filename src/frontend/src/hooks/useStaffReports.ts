import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Report, ReportStatus } from '../backend';

export function useGetReportsBySchool(schoolId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Report[]>({
    queryKey: ['reports', schoolId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReportsBySchool(schoolId);
    },
    enabled: !!actor && !actorFetching && schoolId > 0,
  });
}

interface UpdateReportStatusParams {
  reportId: bigint;
  status: ReportStatus;
}

export function useUpdateReportStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, status }: UpdateReportStatusParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateReportStatus(reportId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
