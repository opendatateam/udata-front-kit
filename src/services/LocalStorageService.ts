export default {
  isAvailable(): boolean {
    const testKey = '__storage_test__'
    try {
      localStorage.setItem(testKey, testKey)
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  },
  setItem(key: string, value: object | string) {
    try {
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value))
      } else {
        localStorage.setItem(key, value)
      }
    } catch (err) {
      // localStorage can be unavailable (blocked cookies, private browsing, sandboxed iframe...)
      console.warn(`Failed to write to localStorage (key: ${key})`, err)
    }
  },
  getItem(key: string) {
    let item: string | null
    try {
      item = localStorage.getItem(key)
    } catch (err) {
      console.warn(`Failed to read from localStorage (key: ${key})`, err)
      return undefined
    }
    if (item !== null) {
      try {
        return JSON.parse(item)
      } catch {
        return item
      }
    }
  },
  removeItem(key: string) {
    try {
      localStorage.removeItem(key)
    } catch (err) {
      console.warn(`Failed to remove from localStorage (key: ${key})`, err)
    }
  }
}
