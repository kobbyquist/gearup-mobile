import { API, get, put } from './api';

export const userService = {
  getMyProfile: async () => {
    return await get(`${API.USER}/api/users/me`);
  },

  updateProfile: async (data: {
    name?: string;
    phone?: string;
    profileImage?: string;
    bio?: string;
    location?: string;
  }) => {
    return await put(`${API.USER}/api/users/me`, data);
  },

  getUserById: async (userId: number) => {
    return await get(`${API.USER}/api/users/${userId}`);
  },

  getAllMechanics: async () => {
    const api = await getAPI();
    return await get(`${api.USER}/api/users/mechanics`);
  },

};