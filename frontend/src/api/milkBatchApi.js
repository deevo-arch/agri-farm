import apiClient from './axios'

export function getMilkBatchesByFarm(farmId) {
  return apiClient.get(`/api/milk-batches/farm/${farmId}`).then((res) => res.data)
}

export function getMilkBatchById(id) {
  return apiClient.get(`/api/milk-batches/${id}`).then((res) => res.data)
}

export function createMilkBatch({
  batchCode,
  farmId,
  collectedById,
  collectionDate,
  quantityLitres,
  livestockIds,
}) {
  return apiClient
    .post('/api/milk-batches', {
      batchCode,
      farmId,
      collectedById,
      collectionDate,
      quantityLitres,
      livestockIds,
    })
    .then((res) => res.data)
}
