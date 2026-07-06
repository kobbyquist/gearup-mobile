import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAPI, get, post } from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'OWNER' | 'MECHANIC';
}

export interface LoginData {
  email: string;
  password: string;
}
export interface VerifyRegistrationData extends RegisterData {
  code: string;
}
export const authService = {
  register: async (data: RegisterData) => {
    const api = await getAPI();
    const response = await post(`${api.AUTH}/api/auth/register`, data);
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response));
    return response;
  },
  sendRegistrationCode: async (data: RegisterData) => {
    const api = await getAPI();
    return await post(`${api.AUTH}/api/auth/register/send-code`, data);
  },
  verifyRegistration: async (data: VerifyRegistrationData) => {
    const api = await getAPI();
    const response = await post(`${api.AUTH}/api/auth/register/verify`, data);
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response));
    return response;
  },
  login: async (data: LoginData) => {
    const api = await getAPI();
    const response = await post(`${api.AUTH}/api/auth/login`, data);
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response));
    return response;
  },

  forgotPassword: async (email: string) => {
    const api = await getAPI();
    return await post(`${api.AUTH}/api/auth/forgot-password`, { email });
  },
  verifyResetCode: async (email: string, code: string) => {
    const api = await getAPI();
    return await post(`${api.AUTH}/api/auth/verify-reset-code`, { email, code });
  },
sendAccountDeletionCode: async () => {
    const api = await getAPI();
    return await post(`${api.AUTH}/api/auth/account/deletion/send-code`, {}, true);
  },
  verifyAccountDeletion: async (code: string) => {
    const api = await getAPI();
    return await post(`${api.AUTH}/api/auth/account/deletion/verify`, { code }, true);
  },
  getDeletionRequestStatus: async () => {
    const api = await getAPI();
    return await get(`${api.AUTH}/api/auth/account/deletion/status`);
  },
  cancelAccountDeletion: async () => {
    const api = await getAPI();
    return await post(`${api.AUTH}/api/auth/account/deletion/cancel`, {}, true);
  },
  resetPassword: async (email: string, code: string, newPassword: string) => {
    const api = await getAPI();
    return await post(`${api.AUTH}/api/auth/reset-password`, { email, code, newPassword });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getStoredUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};