import apiClient from './apiClient';

export interface StaffMember {
  id: number;
  username: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: 'staff' | 'owner';
  phone: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
}

export interface InviteStaffPayload {
  full_name: string;
  email: string;
  phone_number: string;
  temporary_password: string;
}

interface BackendInviteStaffResponse {
  message: string;
  credentials?: {
    email?: string;
    temporary_password?: string;
    username?: string;
  };
  email?: string;
  username?: string;
  temp_password?: string;
  temporary_password?: string;
}

export interface InviteStaffResponse {
  username: string;
  email: string;
  temp_password: string;
  message: string;
}

export const staffServiceReal = {
  getAll: async (): Promise<StaffMember[]> => {
    const response = await apiClient.get('/auth/staff/list_staff/');
    return response.data;
  },

  invite: async (data: InviteStaffPayload): Promise<InviteStaffResponse> => {
    const response = await apiClient.post<BackendInviteStaffResponse>('/auth/staff/invite/', data);
    const credentials = response.data.credentials;

    return {
      username: credentials?.username || response.data.username || data.email,
      email: credentials?.email || response.data.email || data.email,
      temp_password:
        credentials?.temporary_password ||
        response.data.temporary_password ||
        response.data.temp_password ||
        data.temporary_password,
      message: response.data.message,
    };
  },

  toggleActive: async (id: number): Promise<StaffMember> => {
    const response = await apiClient.patch(`/auth/staff/${id}/toggle_active/`);
    return response.data;
  },
};
