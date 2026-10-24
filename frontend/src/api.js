const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const API_BASE = `${configuredApiUrl.replace(/\/$/, '')}${configuredApiUrl.replace(/\/$/, '').endsWith('/api') ? '' : '/api'}`
const AUTH_KEY = 'mmp-auth-session'

export function assetUrl(path) {
  if (!path || /^(https?:|data:|blob:)/i.test(path)) return path
  // Files shipped with the frontend live under its public directory (for
  // example the original /media/hero slides). Only uploaded files are served
  // by the backend host.
  if (!path.startsWith('/uploads/')) return path.startsWith('/') ? path : `/${path}`
  const origin = API_BASE.replace(/\/api$/, '')
  return `${origin}${path}`
}

export function saveAuthSession(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event('mmp-auth-change'))
}

export function loadAuthSession() {
  const savedSession = localStorage.getItem(AUTH_KEY)
  return savedSession ? JSON.parse(savedSession) : null
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_KEY)
  window.dispatchEvent(new Event('mmp-auth-change'))
}

export async function apiFetch(path, options = {}) {
  const session = loadAuthSession()

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(session?.token
        ? { Authorization: `Bearer ${session.token}` }
        : {}),
      ...options.headers,
    },
  })
}

export async function apiRequest(path, options = {}) {
  const response = await apiFetch(path, options)

  const result = await response.json()

  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'The request failed.')
  }

  return result.data
}

export async function uploadImage(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WEBP image.')
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('Choose an image smaller than 10 MB.')
  const session = loadAuthSession()
  const response = await fetch(`${API_BASE}/uploads/images`, {
    method: 'POST',
    headers: { 'Content-Type': file.type, ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}) },
    body: file,
  })
  const result = await response.json()
  if (!response.ok || result.success === false) throw new Error(result.message || 'Image upload failed.')
  return result.data.url
}
