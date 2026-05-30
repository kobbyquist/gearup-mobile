import AsyncStorage from '@react-native-async-storage/async-storage';
import { API, post } from './api';

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

export const authService = {
  register: async (data: RegisterData) => {
    const response = await post(`${API.AUTH}/api/auth/register`, data);
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response));
    return response;
  },

  login: async (data: LoginData) => {
    const response = await post(`${API.AUTH}/api/auth/login`, data);
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response));
    return response;
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