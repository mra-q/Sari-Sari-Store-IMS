export type UserRole = 'admin' | 'owner' | 'staff' | 'OWNER' | 'STAFF';

export type AppRole = 'owner' | 'staff';

export interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  role: UserRole;
  phone?: string;
  storeName?: string;
  storeAddress?: string;
  store_name?: string;
  store_address?: string;
  isActive?: boolean;
  is_active?: boolean;
  mustChangePassword?: boolean;
  must_change_password?: boolean;
}

export interface OwnerSignupInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  storeName: string;
  storeAddress: string;
  password: string;
}
