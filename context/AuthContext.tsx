import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { OwnerSignupInput, User, UserRole } from '@/types/user';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerOwner: (payload: OwnerSignupInput) => Promise<User>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start, try to restore session from refresh cookie
  useEffect(() => {
    authService.refreshSession()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const loggedInUser = await authService.login(normalizeEmail(email), password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const registerOwner = async (payload: OwnerSignupInput): Promise<User> => {
    const created = await authService.registerOwner({
      ...payload,
      email: normalizeEmail(payload.email),
      phone: payload.phone.trim(),
      storeName: payload.storeName.trim(),
      storeAddress: payload.storeAddress.trim(),
    });
    return created;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<User> => {
    const updatedUser = await authService.changePassword(oldPassword, newPassword);
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerOwner,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
