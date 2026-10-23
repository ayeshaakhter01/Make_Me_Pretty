const API_BASE = 'http://localhost:5000/api'
const AUTH_KEY = 'mmp-auth-session'

export function saveAuthSession(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data))
}

export function loadAuthSession() {
  const savedSession = localStorage.getItem(AUTH_KEY)
  return savedSession ? JSON.parse(savedSession) : null
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_KEY)
}

export async function apiRequest(path, options = {}) {
  const session = loadAuthSession()

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token
        ? { Authorization: `Bearer ${session.token}` }
        : {}),
      ...options.headers,
    },
  })

  const result = await response.json()

  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'The request failed.')
  }

  return result.data
}