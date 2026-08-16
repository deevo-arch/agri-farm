import apiClient from './axios'

export function getVaccinationsByLivestock(livestockId) {
  return apiClient.get(`/api/vaccinations/livestock/${livestockId}`).then((res) => res.data)
}

export function getMedicationsByLivestock(livestockId) {
  return apiClient.get(`/api/medications/livestock/${livestockId}`).then((res) => res.data)
}
