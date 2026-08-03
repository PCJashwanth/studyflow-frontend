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

// ── Client-side optimization: caching ──────────────────────────────────────
// Views refetch on every mount, so moving between tabs repeats the same GETs.
// This memoizes GET responses for a short window, which removes the redundant
// network round trips without letting the UI go stale.
//
// Any write (POST/PUT/PATCH/DELETE) clears the cache, so a change is never
// hidden behind a stale read.
const TTL_MS = 30_000
const cache = new Map()

export function clearApiCache() {
  cache.clear()
}

export async function cachedGet(url, config) {
  const key = `${url}|${JSON.stringify(config?.params ?? {})}`
  const hit = cache.get(key)

  if (hit && Date.now() - hit.at < TTL_MS) return hit.res

  const res = await api.get(url, config)
  cache.set(key, { res, at: Date.now() })
  return res
}

// Writes invalidate everything — simpler than tracking which key a write
// affects, and correct, which matters more than cleverness here.
for (const method of ['post', 'put', 'patch', 'delete']) {
  const original = api[method].bind(api)
  api[method] = async (...args) => {
    const res = await original(...args)
    clearApiCache()
    return res
  }
}
