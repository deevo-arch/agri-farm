import apiClient from './apiClient';

export const consumerApi = {
  scanBatch: (qrData) => apiClient.get('/consumer/scan', { params: { qrData } }),
};