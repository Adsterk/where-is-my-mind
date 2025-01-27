import { useState, useEffect } from 'react'

export function useFormPersistence<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    // Try to get stored data on initial load
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          return JSON.parse(stored) as T
        } catch {
          return initialState
        }
      }
    }
    return initialState
  })

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
} 