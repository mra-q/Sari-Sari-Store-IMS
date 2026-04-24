import { apiRequest } from './api';

export interface User {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone_number?: string;
  role: 'admin' | 'owner' | 'staff';
  is_active: boolean;
  date_joined?: string;
}

export interface UserCreateInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: 'admin' | 'owner' | 'staff';
}

export interface ActivityLog {
  id: number;
  user?: number;
  user_email?: string;
  action: string;
  model_name: string;
  object_id?: string;
  changes?: Record<string, any>;
  timestamp: string;
  ip_address?: string;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await apiRequest<{ results: User[] }>('/users/');
  return response.results || response as any;
};

export const getUserById = async (id: string | number): Promise<User> => {
  return apiRequest<User>(`/users/${id}/`);
};

export const getCurrentUser = async (): Promise<User> => {
  return apiRequest<User>('/users/me/');
};

export const createUser = async (data: UserCreateInput): Promise<User> => {
  return apiRequest<User>('/users/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateUser = async (id: string | number, data: Partial<User>): Promise<User> => {
  return apiRequest<User>(`/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteUser = async (id: string | number): Promise<void> => {
  await apiRequest<void>(`/users/${id}/`, {
    method: 'DELETE',
  });
};

export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  const response = await apiRequest<{ results: ActivityLog[] }>('/activity-logs/');
  return response.results || response as any;
};

export const userService = {
  getUsers,
  getUserById,
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  getActivityLogs,
};
