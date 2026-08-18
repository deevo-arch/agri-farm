import apiClient from './axios'

export function getVetVisitsByLivestock(livestockId) {
  return apiClient.get(`/api/vet-visits/livestock/${livestockId}`).then((res) => res.data)
}

export function getVetVisitById(id) {
  return apiClient.get(`/api/vet-visits/${id}`).then((res) => res.data)
}

export function getMyVetVisits() {
  return apiClient.get('/api/vet-visits/mine').then((res) => res.data)
}

export function getPendingVetVisits() {
  return apiClient.get('/api/vet-visits/pending').then((res) => res.data)
}

export function getVetVisitsByVet(vetId) {
  return apiClient.get(`/api/vet-visits/vet/${vetId}`).then((res) => res.data)
}

export function requestVetVisit({ livestockId, preferredDate, reason, notes }) {
  return apiClient
    .post('/api/vet-visits', { livestockId, preferredDate, reason, notes })
    .then((res) => res.data)
}

export function updateVetVisit(id, { preferredDate, reason, notes }) {
  return apiClient.put(`/api/vet-visits/${id}`, { preferredDate, reason, notes }).then((res) => res.data)
}

export function acceptVetVisit(id) {
  return apiClient.post(`/api/vet-visits/${id}/accept`).then((res) => res.data)
}

export function rejectVetVisit(id) {
  return apiClient.post(`/api/vet-visits/${id}/reject`).then((res) => res.data)
}

export function completeVetVisit(id) {
  return apiClient.post(`/api/vet-visits/${id}/complete`).then((res) => res.data)
}
