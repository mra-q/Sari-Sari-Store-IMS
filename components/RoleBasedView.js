import { useAuth } from '@/context/AuthContext';

export const RoleBasedView = ({ roles, children, fallback = null }) => {
  const { role } = useAuth();

  if (!role || !roles.includes(role)) {
    return fallback;
  }

  return children;
};
