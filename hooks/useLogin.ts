import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types/user';

interface LoginInput {
  email: string;
  password: string;
}

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation<User, Error, LoginInput>({
    mutationFn: ({ email, password }) => login(email, password),
  });
};
