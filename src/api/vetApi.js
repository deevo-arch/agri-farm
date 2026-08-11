import apiClient from './apiClient';

export const vetApi = {
  getAppointments: () => apiClient.get('/vet/appointments'),
  confirmAppointment: (id) => apiClient.patch(`/vet/appointments/${id}/confirm`),
  getAnimalByQR: (uniqueId) => apiClient.get(`/animals/${uniqueId}`),
  regenerateQR: (id) => apiClient.post(`/animals/${id}/regenerate-qr`),
};