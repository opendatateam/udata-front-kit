import axios from 'axios'
import { ref } from 'vue'

/**
 * @typedef {object} ComposableFetchResult
 * @property {ref} data
 * @property {ref} error
 *
 * @param {string} url
 * @param {function?} cb
 * @returns {ComposableFetchResult}
 */
export function useFetch(url, cb) {
  const data = ref({})
  const error = ref(null)

  axios.get(url)
    .then((res) => data.value = res.data)
    .catch((err) => (error.value = err))
    .finally(() => {
      if (cb) cb()
    })

  return { data, error }
}
