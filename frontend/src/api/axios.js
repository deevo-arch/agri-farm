import axios from 'axios'
import { clearStoredAuth, getStoredAuth } from '../auth/storage'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const apiClient = axios.create({ baseURL })

apiClient.interceptors.request.use((config) => {
  const auth = getStoredAuth()
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isAuthEndpoint = error.config?.url?.startsWith('/api/auth/')

    if (status === 401 && !isAuthEndpoint) {
      clearStoredAuth()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
