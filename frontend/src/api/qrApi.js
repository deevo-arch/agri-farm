import apiClient from './axios'

export function generateQrForMilkBatch(milkBatchId) {
  return apiClient.post(`/api/milk-batches/${milkBatchId}/qr`).then((res) => res.data)
}
