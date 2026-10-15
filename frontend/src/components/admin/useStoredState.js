import { useEffect, useState } from 'react'

/* Sent when the browser refuses to save (its storage is full), so the dashboard can warn. */
export const STORAGE_FULL_EVENT = 'mmp-storage-full'

/* Works like useState, but the value is also saved in the browser (localStorage)
   so it is still there after a refresh. `seed` is the starting value. */
export function useStoredState(key, seed) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : seed
    } catch {
      return seed
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage is full (photos use the most space) - tell the dashboard instead of crashing
      window.dispatchEvent(new CustomEvent(STORAGE_FULL_EVENT, { detail: key }))
    }
  }, [key, value])

  return [value, setValue]
}
