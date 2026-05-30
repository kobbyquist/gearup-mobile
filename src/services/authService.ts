// ─────────────────────────────────────────
// GEARUP — Auth Service
// ─────────────────────────────────────────
import api from './api';
import * as SecureStore from 'expo-secure-store';
import { User, UserRole } from '../types';

interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
}

interface LoginPayload {
  phone: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Register new user
export const register = async (payload: RegisterPayload) => {
  const response = await api.post<{ data: { message: string } }>(
    '/auth/register',
    payload
  );
  return response.data;
};

// Verify OTP
export const verifyOtp = async (phone: string, code: string) => {
  const response = await api.post<{ data: AuthResponse }>(
    '/auth/verify-otp',
    { phone, code }
  );
  const { user, token, refreshToken } = response.data.data;

  // Save token and user to secure storage
  await SecureStore.setItemAsync('gearup_token', token);
  await SecureStore.setItemAsync('gearup_refresh', refreshToken);
  await SecureStore.setItemAsync('gearup_user', JSON.stringify(user));

  return { user, token };
};

// Login
export const login = async (payload: LoginPayload) => {
  const response = await api.post<{ data: AuthResponse }>(
    '/auth/login',
    payload
  );
  const { user, token, refreshToken } = response.data.data;

  await SecureStore.setItemAsync('gearup_token', token);
  await SecureStore.setItemAsync('gearup_refresh', refreshToken);
  await SecureStore.setItemAsync('gearup_user', JSON.stringify(user));

  return { user, token };
};

// Logout
export const logout = async () => {
  await SecureStore.deleteItemAsync('gearup_token');
  await SecureStore.deleteItemAsync('gearup_refresh');
  await SecureStore.deleteItemAsync('gearup_user');
};

// Get stored user (for app reload)
export const getStoredUser = async (): Promise<User | null> => {
  const userJson = await SecureStore.getItemAsync('gearup_user');
  return userJson ? JSON.parse(userJson) : null;
};

export const getStoredToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync('gearup_token');
};