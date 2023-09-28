import axios from "axios"
import { useUserStore } from "../store/UserStore"

// inject token in requests if user is loggedIn
axios.interceptors.request.use(config => {
  const store = useUserStore()
  if (store.$state.isLoggedIn) {
    config.headers = {
      Authorization: `Bearer ${store.$state.token}`
    }
  }
  return config
}, error => Promise.reject(error))

/**
 * HTTP-fetch an URL
 *
 * @param {string} url
 * @param {function?} onError
 * @param {function?} onFinally
 * @returns {object}
 */
export async function useFetch(url, onError, onFinally) {
  try {
    const res = await axios.get(url)
    return res.data
  } catch (error) {
    if (onError) {
      onError(error)
    } else {
      throw error
    }
  } finally {
    if (onFinally) onFinally()
  }
}
