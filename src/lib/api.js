import axios from 'axios'

// Single axios instance pointed at the backend.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Token persistence (survives refresh).
export const tokenStore = {
  get: () => localStorage.getItem('token'),
  set: (t) => localStorage.setItem('token', t),
  clear: () => localStorage.removeItem('token'),
}

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Let AuthContext react to auth failures (expired/invalid token).
let onUnauthorized = null
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      tokenStore.clear()
      if (onUnauthorized) onUnauthorized()
    }
    return Promise.reject(err)
  },
)
