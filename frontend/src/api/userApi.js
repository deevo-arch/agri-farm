import apiClient from './axios'

export function getUsers() {
  return apiClient.get('/api/users').then((res) => res.data)
}

export function getUser(id) {
  return apiClient.get(`/api/users/${id}`).then((res) => res.data)
}

export function createUser({ fullName, email, password, role }) {
  return apiClient.post('/api/users', { fullName, email, password, role }).then((res) => res.data)
}

export function updateMyProfile({ fullName, email }) {
  return apiClient.patch('/api/users/me', { fullName, email }).then((res) => res.data)
}

export function updateUser(id, { fullName, email, role }) {
  return apiClient.put(`/api/users/${id}`, { fullName, email, role }).then((res) => res.data)
}
