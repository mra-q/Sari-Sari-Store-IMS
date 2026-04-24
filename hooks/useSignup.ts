import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import type { OwnerSignupInput, User } from '@/types/user';

export const useSignup = () => {
  const { registerOwner } = useAuth();

  return useMutation<User, Error, OwnerSignupInput>({
    mutationFn: (payload) => registerOwner(payload),
  });
};
