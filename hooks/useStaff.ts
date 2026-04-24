import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffServiceReal, InviteStaffPayload } from '@/services/staffServiceReal';

export const useStaff = () => {
  return useQuery({
    queryKey: ['staff'],
    queryFn: () => staffServiceReal.getAll(),
  });
};

export const useInviteStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InviteStaffPayload) => staffServiceReal.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

export const useToggleStaffActive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => staffServiceReal.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};
