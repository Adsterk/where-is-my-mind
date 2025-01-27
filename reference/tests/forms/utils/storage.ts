export function getStorageData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue

    const parsed = JSON.parse(item)
    return parsed ?? defaultValue
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

export function setStorageData(key: string, data: any): void {
  if (typeof window === 'undefined') return

  try {
    const serializedData = JSON.stringify(data)
    localStorage.setItem(key, serializedData)
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
} 