import { API, get, post } from './api';

export const reviewService = {
  createReview: async (data: {
    jobId: number;
    revieweeId: number;
    rating: number;
    comment?: string;
  }) => {
    return await post(`${API.REVIEW}/api/reviews`, data, true);
  },

  getReviewsForUser: async (userId: number) => {
    return await get(`${API.REVIEW}/api/reviews/user/${userId}`);
  },

  getMyReviews: async () => {
    return await get(`${API.REVIEW}/api/reviews/my`);
  },

  getAverageRating: async (userId: number) => {
    return await get(`${API.REVIEW}/api/reviews/rating/${userId}`);
  },
};