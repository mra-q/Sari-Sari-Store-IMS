import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { AppRole, UserRole } from '@/types/user';

export const normalizeUserRole = (role: UserRole | null | undefined): AppRole | null => {
  if (!role) return null;
  const lowerRole = role.toLowerCase();
  if (lowerRole === 'owner') return 'owner';
  if (lowerRole === 'staff') return 'staff';
  if (lowerRole === 'admin') return 'owner';
  return null;
};

export const useUserRole = () => {
  const { role } = useAuth();

  return useMemo(() => {
    const normalizedRole = normalizeUserRole(role);

    return {
      role: normalizedRole,
      rawRole: role,
      isOwner: normalizedRole === 'owner',
      isStaff: normalizedRole === 'staff',
    };
  }, [role]);
};

