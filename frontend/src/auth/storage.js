const STORAGE_KEY = 'agritrust.auth'

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.token) return null
    return parsed
  } catch {
    return null
  }
}

export function setStoredAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY)
}
