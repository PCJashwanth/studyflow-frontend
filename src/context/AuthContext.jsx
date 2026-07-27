import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, tokenStore, setUnauthorizedHandler, clearApiCache } from '../lib/api'

const AuthContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, if a token exists, validate it by fetching the profile.
  useEffect(() => {
    let active = true
    async function bootstrap() {
      if (!tokenStore.get()) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get('/api/auth/me')
        if (active) setUser(data.user)
      } catch {
        tokenStore.clear()
      } finally {
        if (active) setLoading(false)
      }
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [])

  // A 401 anywhere logs the user out.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    tokenStore.set(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async (payload) => {
    const { data } = await api.post('/api/auth/signup', payload)
    tokenStore.set(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearApiCache()
    tokenStore.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
