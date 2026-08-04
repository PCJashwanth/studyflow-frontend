import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, tokenStore, setUnauthorizedHandler } from '../lib/api'

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

  // Step 1: verify credentials → backend emails an OTP (returns { otpRequired, email, devCode }).
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    return data
  }, [])

  // Step 2: verify the emailed code → sets the token + user.
  const verifyOtp = useCallback(async (email, code) => {
    const { data } = await api.post('/api/auth/verify-otp', { email, code })
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
    tokenStore.clear()
    setUser(null)
  }, [])

  // Merge fields into the current user (e.g. after editing the profile name).
  const updateUser = useCallback((fields) => setUser((u) => (u ? { ...u, ...fields } : u)), [])

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
