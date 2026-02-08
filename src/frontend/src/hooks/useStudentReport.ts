import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ReportCategory } from '../backend';

interface SubmitReportParams {
  schoolId: bigint;
  category: ReportCategory;
  text: string;
}

export function useSubmitReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ schoolId, category, text }: SubmitReportParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitAnonymousReport(schoolId, category, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolStats'] });
    },
  });
}
