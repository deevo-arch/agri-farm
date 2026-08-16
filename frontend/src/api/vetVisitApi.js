import apiClient from './axios'

export function getVetVisitsByLivestock(livestockId) {
  return apiClient.get(`/api/vet-visits/livestock/${livestockId}`).then((res) => res.data)
}
