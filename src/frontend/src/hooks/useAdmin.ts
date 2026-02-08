import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { School, StaffAccount } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetSchools() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<School[]>({
    queryKey: ['adminSchools'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSchools();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateSchool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, address }: { name: string; address: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSchool(name, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSchools'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['schoolStats'] });
    },
  });
}

export function useUpdateSchool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      schoolId,
      name,
      address,
    }: {
      schoolId: bigint;
      name: string;
      address: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSchool(schoolId, name, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSchools'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
}

export function useDeleteSchool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schoolId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSchool(schoolId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSchools'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['schoolStats'] });
    },
  });
}

export function useGetAllStaff() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StaffAccount[]>({
    queryKey: ['allStaff'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStaff();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      principal,
      schoolId,
      name,
      email,
    }: {
      principal: Principal;
      schoolId: bigint;
      name: string;
      email: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStaffAccount(principal, schoolId, name, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStaff'] });
    },
  });
}

export function useUpdateStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      staffId,
      name,
      email,
      enabled,
    }: {
      staffId: bigint;
      name: string;
      email: string;
      enabled: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStaffAccount(staffId, name, email, enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStaff'] });
    },
  });
}

export function useDeleteStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteStaffAccount(staffId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStaff'] });
    },
  });
}

export function useGetSchoolStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<
    Array<{
      schoolId: bigint;
      schoolName: string;
      totalReports: bigint;
    }>
  >({
    queryKey: ['schoolStats'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSchoolsStats();
    },
    enabled: !!actor && !actorFetching,
  });
}
