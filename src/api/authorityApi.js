import apiClient from './apiClient';

export const authorityApi = {
  getProfile: () => apiClient.get('/authority/profile'),
  createBatch: (data) => apiClient.post('/batches', data),
  getBatch: (batchCode) => apiClient.get(`/batches/${batchCode}`),
  generateBarcode: (batchCode) => apiClient.post(`/batches/${batchCode}/barcode`),
  getFarmLivestock: (farmId) => apiClient.get(`/farms/${farmId}/livestock`),
  getAnimalBatches: (uniqueId) => apiClient.get(`/animals/${uniqueId}/batches`),
};