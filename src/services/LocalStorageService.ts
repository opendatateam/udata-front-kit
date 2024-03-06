export default {
  setItem(key: string, value: object | string) {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value))
    } else {
      localStorage.setItem(key, value)
    }
  },
  getItem(key: string) {
    const item = localStorage.getItem(key)
    if (item !== null) {
      try {
        return JSON.parse(item)
      } catch (e) {
        return item
      }
    }
  },
  removeItem(key: string) {
    localStorage.removeItem(key)
  }
}
