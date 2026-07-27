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

// ---------------------------------------------------------------------------
// Client-side optimization #2 (Assignment 3): in-memory GET response cache.
// Repeat reads of the same endpoint within TTL are served instantly from
// memory instead of re-downloading large JSON payloads over the network.
// The cache is cleared on writes (POST/PUT/PATCH/DELETE) and on logout, so
// the UI never shows stale data.
// ---------------------------------------------------------------------------
const responseCache = new Map()
const CACHE_TTL_MS = 60_000

export function clearApiCache() {
  responseCache.clear()
}

// Serve cached GETs; stamp fresh GET responses into the cache.
api.interceptors.request.use((config) => {
  if ((config.method || 'get').toLowerCase() !== 'get') {
    // Any write invalidates the whole cache (simple + always correct).
    responseCache.clear()
    return config
  }
  const hit = responseCache.get(config.url)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    // Short-circuit the network: resolve from cache via the adapter.
    config.adapter = () =>
      Promise.resolve({
        ...hit.response,
        config,
        headers: { ...hit.response.headers, 'x-client-cache': 'HIT' },
      })
  }
  return config
})

api.interceptors.response.use((res) => {
  const method = (res.config.method || 'get').toLowerCase()
  const fromCache = res.headers?.['x-client-cache'] === 'HIT'
  if (method === 'get' && !fromCache && res.status === 200) {
    responseCache.set(res.config.url, {
      at: Date.now(),
      response: { data: res.data, status: res.status, statusText: res.statusText, headers: res.headers },
    })
  }
  return res
})
