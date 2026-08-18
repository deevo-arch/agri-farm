import apiClient from './axios'

export function getVaccinationsByLivestock(livestockId) {
  return apiClient.get(`/api/vaccinations/livestock/${livestockId}`).then((res) => res.data)
}

export function getMedicationsByLivestock(livestockId) {
  return apiClient.get(`/api/medications/livestock/${livestockId}`).then((res) => res.data)
}

// administeredBy is never sent — the backend derives it from the authenticated vet.
export function createVaccination({ livestockId, vetVisitId, vaccineName, administeredDate, withdrawalEndDate }) {
  return apiClient
    .post('/api/vaccinations', { livestockId, vetVisitId, vaccineName, administeredDate, withdrawalEndDate })
    .then((res) => res.data)
}

export function createMedication({
  livestockId,
  vetVisitId,
  medicationName,
  dosage,
  administeredDate,
  withdrawalEndDate,
}) {
  return apiClient
    .post('/api/medications', {
      livestockId,
      vetVisitId,
      medicationName,
      dosage,
      administeredDate,
      withdrawalEndDate,
    })
    .then((res) => res.data)
}
