import apiClient from './axios'

export function getLivestockByFarm(farmId) {
  return apiClient.get(`/api/farms/${farmId}/livestock`).then((res) => res.data)
}

export function getLivestockById(id) {
  return apiClient.get(`/api/livestock/${id}`).then((res) => res.data)
}

export function getLivestockHealth(id) {
  return apiClient.get(`/api/livestock/${id}/health`).then((res) => res.data)
}

export function createLivestock({ tagNumber, species, dateOfBirth, farmId }) {
  return apiClient
    .post('/api/livestock', { tagNumber, species, dateOfBirth, farmId })
    .then((res) => res.data)
}

export function updateLivestock(id, { species, dateOfBirth, status }) {
  return apiClient
    .patch(`/api/livestock/${id}`, { species, dateOfBirth, status })
    .then((res) => res.data)
}
