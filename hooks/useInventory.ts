import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryServiceReal } from '@/services/inventoryServiceReal';

export const useInventory = (params?: any) => {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryServiceReal.getAll(params),
  });
};

export const useInventorySummary = () => {
  return useQuery({
    queryKey: ['inventory', 'summary'],
    queryFn: () => inventoryServiceReal.getSummary(),
  });
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      inventoryServiceReal.update(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
