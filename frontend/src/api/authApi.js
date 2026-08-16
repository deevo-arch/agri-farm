import apiClient from './axios'

export function login(email, password) {
  return apiClient.post('/api/auth/login', { email, password }).then((res) => res.data)
}

export function register({ fullName, email, password }) {
  return apiClient
    .post('/api/auth/register', { fullName, email, password, role: 'FARMER' })
    .then((res) => res.data)
}
