import { API, get, post, put, del } from './api';

export const vehicleService = {
  addVehicle: async (data: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color?: string;
    description?: string;
    type?: string;
  }) => {
    return await post(`${API.VEHICLE}/api/vehicles`, data, true);
  },

  getMyVehicles: async () => {
    return await get(`${API.VEHICLE}/api/vehicles/my`);
  },

  getVehicleById: async (vehicleId: number) => {
    return await get(`${API.VEHICLE}/api/vehicles/${vehicleId}`);
  },

  updateVehicle: async (vehicleId: number, data: object) => {
    return await put(`${API.VEHICLE}/api/vehicles/${vehicleId}`, data);
  },

  deleteVehicle: async (vehicleId: number) => {
    return await del(`${API.VEHICLE}/api/vehicles/${vehicleId}`);
  },
};