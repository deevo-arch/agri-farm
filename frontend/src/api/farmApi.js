import apiClient from './axios'

export function getMyFarms() {
  return apiClient.get('/api/farms/mine').then((res) => res.data)
}
