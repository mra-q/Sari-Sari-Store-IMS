import React, { ReactNode } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import type { AppRole } from '@/types/user';

interface RoleBasedViewProps {
  roles: AppRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleBasedView: React.FC<RoleBasedViewProps> = ({ roles, children, fallback = null }) => {
  const { role } = useUserRole();

  if (!role || !roles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleBasedView;
