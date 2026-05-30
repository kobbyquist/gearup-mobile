import { API, get, post, put } from './api';

export const paymentService = {
  createPayment: async (data: {
    jobId: number;
    payeeId: number;
    amount: number;
    method: 'MOBILE_MONEY' | 'CASH' | 'BANK_TRANSFER';
    notes?: string;
  }) => {
    return await post(`${API.PAYMENT}/api/payments`, data, true);
  },

  completePayment: async (paymentId: number) => {
    return await put(`${API.PAYMENT}/api/payments/${paymentId}/complete`, {});
  },

  getPaymentByJob: async (jobId: number) => {
    return await get(`${API.PAYMENT}/api/payments/job/${jobId}`);
  },

  getMyPaymentsAsPayer: async () => {
    return await get(`${API.PAYMENT}/api/payments/my/payer`);
  },

  getMyPaymentsAsPayee: async () => {
    return await get(`${API.PAYMENT}/api/payments/my/payee`);
  },
};