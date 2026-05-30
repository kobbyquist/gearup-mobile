import { API, get, post, put, del } from './api';

export const partsService = {
  createListing: async (data: {
    name: string;
    description: string;
    price: number;
    brand?: string;
    carMake?: string;
    carModel?: string;
    condition?: string;
  }) => {
    return await post(`${API.PARTS}/api/parts`, data, true);
  },

  getAvailableParts: async () => {
    return await get(`${API.PARTS}/api/parts/available`, false);
  },

  getMyListings: async () => {
    return await get(`${API.PARTS}/api/parts/my`);
  },

  searchByName: async (name: string) => {
    return await get(`${API.PARTS}/api/parts/search?name=${name}`, false);
  },

  searchByCarMake: async (carMake: string) => {
    return await get(`${API.PARTS}/api/parts/search?carMake=${carMake}`, false);
  },

  getPartById: async (partId: number) => {
    return await get(`${API.PARTS}/api/parts/${partId}`, false);
  },

  updateListing: async (partId: number, data: object) => {
    return await put(`${API.PARTS}/api/parts/${partId}`, data);
  },

  markAsSold: async (partId: number) => {
    return await put(`${API.PARTS}/api/parts/${partId}/sold`, {});
  },

  deleteListing: async (partId: number) => {
    return await del(`${API.PARTS}/api/parts/${partId}`);
  },
};