import { API, get, post, put } from './api';

export const jobService = {
  createJob: async (data: {
    title: string;
    description: string;
    vehicleId: number;
    type: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    estimatedCost?: number;
  }) => {
    return await post(`${API.JOB}/api/jobs`, data, true);
  },

  getMyJobsAsOwner: async () => {
    return await get(`${API.JOB}/api/jobs/my/owner`);
  },

  getMyJobsAsMechanic: async () => {
    return await get(`${API.JOB}/api/jobs/my/mechanic`);
  },

  getAvailableJobs: async () => {
    return await get(`${API.JOB}/api/jobs/available`);
  },

  getJobById: async (jobId: number) => {
    return await get(`${API.JOB}/api/jobs/${jobId}`);
  },

  acceptJob: async (jobId: number) => {
    return await put(`${API.JOB}/api/jobs/${jobId}/accept`, {});
  },

  startJob: async (jobId: number) => {
    return await put(`${API.JOB}/api/jobs/${jobId}/start`, {});
  },

  completeJob: async (jobId: number, finalCost: number) => {
    return await put(`${API.JOB}/api/jobs/${jobId}/complete`, { finalCost });
  },

  updateFinalCost: async (jobId: number, finalCost: number) => {
    return await put(`${API.JOB}/api/jobs/${jobId}/cost`, { finalCost });
  },

  cancelJob: async (jobId: number) => {
    return await put(`${API.JOB}/api/jobs/${jobId}/cancel`, {});
  },
  
};