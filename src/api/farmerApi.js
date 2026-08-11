import apiClient from './apiClient';

export const farmerApi = {
  getProfile: () => apiClient.get('/farmer/profile'),
  updateProfile: (data) => apiClient.put('/farmer/profile', data),
  getAnimals: () => apiClient.get('/farmer/animals'),
  createAnimal: (data) => apiClient.post('/farmer/animals', data),
  getAnimalQR: (id) => apiClient.get(`/farmer/animals/${id}/qr`),
  getNearbyVets: (lat, lng, radius = 10) =>
    apiClient.get(`/vets/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
  createAppointment: (data) => apiClient.post('/appointments', data),
  getAppointments: () => apiClient.get('/farmer/appointments'),
};