export const formatCurrency = (value: number): string => {
  return `PHP ${value.toFixed(2)}`;
};

export const getRoleLabel = (role: string | null | undefined): string => {
  if (!role) return 'Unknown';
  const normalizedRole = role.toLowerCase();
  if (normalizedRole === 'owner') return 'Store Owner';
  if (normalizedRole === 'staff') return 'Staff';
  if (normalizedRole === 'admin') return 'Store Owner';
  return role;
};

export const getUserDisplayName = (user?: {
  name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
} | null): string => {
  if (!user) return 'User';

  const explicitName = user.name?.trim();
  if (explicitName) return explicitName;

  const fullName = [user.first_name, user.middle_name, user.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName) return fullName;
  return user.email?.trim() || 'User';
};

export const getUserStoreName = (user?: {
  storeName?: string;
  store_name?: string;
} | null): string => {
  return user?.storeName?.trim() || user?.store_name?.trim() || 'Your Store';
};
