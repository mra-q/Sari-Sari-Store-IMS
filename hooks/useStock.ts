import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockServiceReal } from '@/services/stockServiceReal';

export const useStockMovements = (params?: any) => {
  return useQuery({
    queryKey: ['stock-movements', params],
    queryFn: () => stockServiceReal.getMovements(params),
  });
};

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stockServiceReal.createMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useCycleCounts = (params?: any) => {
  return useQuery({
    queryKey: ['cycle-counts', params],
    queryFn: () => stockServiceReal.getCycleCounts(params),
  });
};

export const useCreateCycleCount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stockServiceReal.createCycleCount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-counts'] });
    },
  });
};

export const useCompleteCycleCount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, actualQuantity }: { id: number; actualQuantity: number }) =>
      stockServiceReal.completeCycleCount(id, actualQuantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-counts'] });
    },
  });
};

export const useRestockRequests = (params?: any) => {
  return useQuery({
    queryKey: ['restock-requests', params],
    queryFn: () => stockServiceReal.getRestockRequests(params),
  });
};

export const useCreateRestockRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stockServiceReal.createRestockRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restock-requests'] });
    },
  });
};

export const useApproveRestockRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stockServiceReal.approveRestockRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restock-requests'] });
    },
  });
};
