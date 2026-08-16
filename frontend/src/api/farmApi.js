import apiClient from './axios'

export function getMyFarms() {
  return apiClient.get('/api/farms/mine').then((res) => res.data)
}

export function createFarm({ name, location, ownerId }) {
  return apiClient.post('/api/farms', { name, location, ownerId }).then((res) => res.data)
}
