import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Dedicated client for the public trace endpoint: no Authorization header,
// no 401-redirect interceptor. This request must work for anonymous consumers.
const publicApiClient = axios.create({ baseURL })

export function getPublicTrace(token) {
  return publicApiClient.get(`/api/public/trace/${token}`).then((res) => res.data)
}
