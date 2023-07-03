import axios from 'axios'

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
