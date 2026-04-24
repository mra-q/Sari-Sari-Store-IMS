import apiClient from './apiClient';
import type { User } from '@/types/user';

export interface StaffUserInput {
  name: string;
  email: string;
  phone: string;
  role?: 'staff';
  password?: string;
}

interface BackendStaffUser {
  id: number;
  email: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
  is_active?: boolean;
}

interface StaffInviteResponse {
  message?: string;
  credentials?: {
    email: string;
    temporary_password: string;
    username: string;
  };
}

export interface StaffInviteCredentials {
  email: string;
  temporaryPassword: string;
  username: string;
}

export interface StaffInviteResult {
  user: StaffUserRecord;
  credentials: StaffInviteCredentials;
}

export interface StaffUserRecord extends User {
  phone: string;
  isActive: boolean;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const buildStaffName = (user: BackendStaffUser) => {
  const fullName = [
    user.first_name?.trim(),
    user.middle_name?.trim(),
    user.last_name?.trim(),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || user.email;
};

const mapStaffUser = (user: BackendStaffUser): StaffUserRecord => ({
  id: String(user.id),
  email: user.email,
  name: buildStaffName(user),
  first_name: user.first_name,
  middle_name: user.middle_name,
  last_name: user.last_name,
  role: 'staff',
  phone: user.phone ?? '',
  isActive: user.is_active ?? true,
});

export const createStaffUser = async (
  payload: StaffUserInput,
): Promise<StaffUserRecord> => {
  const result = await inviteStaff(payload);
  return result.user;
};

export const inviteStaff = async (
  payload: StaffUserInput,
): Promise<StaffInviteResult> => {
  const response = await apiClient.post<StaffInviteResponse>('/auth/staff/invite/', {
    full_name: payload.name.trim(),
    email: normalizeEmail(payload.email),
    phone_number: payload.phone.trim(),
    ...(payload.password?.trim()
      ? { temporary_password: payload.password.trim() }
      : {}),
  });

  const staffUsers = await getStaffUsers();
  const invitedUser = staffUsers.find(
    (user) => user.email.toLowerCase() === normalizeEmail(payload.email),
  );

  const user =
    invitedUser ??
    {
      id: payload.email,
      email: normalizeEmail(payload.email),
      name: payload.name.trim(),
      role: 'staff',
      phone: payload.phone.trim(),
      isActive: true,
    };

  return {
    user,
    credentials: {
      email: response.data.credentials?.email ?? normalizeEmail(payload.email),
      temporaryPassword:
        response.data.credentials?.temporary_password ?? payload.password?.trim() ?? '',
      username:
        response.data.credentials?.username ?? normalizeEmail(payload.email),
    },
  };
};

export const getStaffUsers = async (): Promise<StaffUserRecord[]> => {
  const response = await apiClient.get<BackendStaffUser[]>('/auth/staff/list_staff/');
  return response.data.map(mapStaffUser);
};

export const updateStaffStatus = async (
  id: string,
  _isActive: boolean,
): Promise<StaffUserRecord> => {
  const response = await apiClient.patch<BackendStaffUser>(`/auth/staff/${id}/toggle_active/`);
  return mapStaffUser(response.data);
};

export const userService = {
  createStaffUser,
  inviteStaff,
  getStaffUsers,
  updateStaffStatus,
};
