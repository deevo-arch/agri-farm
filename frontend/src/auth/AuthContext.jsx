import { createContext, useCallback, useMemo, useState } from 'react'
import { login as loginRequest } from '../api/authApi'
import { clearStoredAuth, getStoredAuth, setStoredAuth } from './storage'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth())

  const login = useCallback(async (email, password) => {
    const data = await loginRequest(email, password)
    const nextAuth = {
      token: data.token,
      userId: data.userId,
      name: data.name,
      role: data.role,
    }
    setStoredAuth(nextAuth)
    setAuth(nextAuth)
    return nextAuth
  }, [])

  const logout = useCallback(() => {
    clearStoredAuth()
    setAuth(null)
  }, [])

  const updateName = useCallback((name) => {
    setAuth((prev) => {
      if (!prev) return prev
      const next = { ...prev, name }
      setStoredAuth(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      token: auth?.token ?? null,
      userId: auth?.userId ?? null,
      name: auth?.name ?? null,
      role: auth?.role ?? null,
      isAuthenticated: Boolean(auth?.token),
      login,
      logout,
      updateName,
    }),
    [auth, login, logout, updateName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
