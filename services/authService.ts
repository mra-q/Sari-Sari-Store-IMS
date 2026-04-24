import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import type { OwnerSignupInput, User } from '@/types/user';
import { getUserDisplayName } from '@/utils/helpers';

type BackendUser = {
  id: string | number;
  email: string;
  name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  role: string;
  phone?: string;
  storeName?: string;
  storeAddress?: string;
  store_name?: string;
  store_address?: string;
  isActive?: boolean;
  is_active?: boolean;
  mustChangePassword?: boolean;
  must_change_password?: boolean;
};

const normalizeRole = (role: string | undefined): User['role'] => {
  const normalizedRole = role?.toLowerCase();
  if (normalizedRole === 'owner') return 'owner';
  if (normalizedRole === 'staff') return 'staff';
  if (normalizedRole === 'admin') return 'admin';
  return 'staff';
};

const normalizeUser = (user: BackendUser): User => {
  const normalizedUser: User = {
    id: String(user.id),
    email: user.email,
    name: user.name?.trim() || '',
    first_name: user.first_name?.trim() || '',
    middle_name: user.middle_name?.trim() || '',
    last_name: user.last_name?.trim() || '',
    role: normalizeRole(user.role),
    phone: user.phone?.trim() || '',
    storeName: user.storeName?.trim() || user.store_name?.trim() || '',
    storeAddress: user.storeAddress?.trim() || user.store_address?.trim() || '',
    store_name: user.store_name?.trim() || user.storeName?.trim() || '',
    store_address: user.store_address?.trim() || user.storeAddress?.trim() || '',
    isActive: user.isActive ?? user.is_active ?? true,
    is_active: user.is_active ?? user.isActive ?? true,
    mustChangePassword:
      user.mustChangePassword ?? user.must_change_password ?? false,
    must_change_password:
      user.must_change_password ?? user.mustChangePassword ?? false,
  };

  normalizedUser.name = getUserDisplayName(normalizedUser);
  return normalizedUser;
};

export const login = async (email: string, password: string): Promise<User> => {
  const response = await apiClient.post('/auth/login/', { email, password });
  const { user, access, refresh } = response.data;
  const normalizedUser = normalizeUser(user);
  
  await AsyncStorage.setItem('access_token', access);
  await AsyncStorage.setItem('refresh_token', refresh);
  await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
  
  return normalizedUser;
};

export const refreshSession = async (): Promise<User> => {
  const userStr = await AsyncStorage.getItem('user');
  if (!userStr) throw new Error('Session expired.');
  const normalizedUser = normalizeUser(JSON.parse(userStr));
  await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
  return normalizedUser;
};

export const registerOwner = async (payload: OwnerSignupInput): Promise<User> => {
  console.log('🔵 SIGNUP ATTEMPT');
  console.log('📍 API_BASE_URL:', apiClient.defaults.baseURL);
  console.log('📦 Payload:', payload);
  
  try {
    const response = await apiClient.post('/auth/signup/', {
      email: payload.email,
      password: payload.password,
      first_name: payload.firstName,
      middle_name: payload.middleName || '',
      last_name: payload.lastName,
      phone: payload.phone,
      store_name: payload.storeName,
      store_address: payload.storeAddress,
    });
    console.log('✅ Signup success');
    const { user, access, refresh } = response.data;
    const normalizedUser = normalizeUser(user);
    
    await AsyncStorage.setItem('access_token', access);
    await AsyncStorage.setItem('refresh_token', refresh);
    await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
    
    return normalizedUser;
  } catch (error: any) {
    console.error('❌ Signup failed:', error.message);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (refreshToken) {
      await apiClient.post('/auth/logout/', { refresh: refreshToken });
    }
  } catch {
    // Clear local session even if the backend logout request fails.
  } finally {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
  }
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
): Promise<User> => {
  try {
    const response = await apiClient.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    const normalizedUser = normalizeUser(response.data.user);
    await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
    return normalizedUser;
  } catch (error: any) {
    const apiError = error?.response?.data?.error;
    const firstMessage =
      apiError?.old_password?.[0] ||
      apiError?.new_password?.[0] ||
      apiError?.non_field_errors?.[0];

    throw new Error(firstMessage || 'Unable to change password.');
  }
};

export const authService = {
  login,
  refreshSession,
  registerOwner,
  logout,
  changePassword,
};
