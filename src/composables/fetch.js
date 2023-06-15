import { ref } from 'vue'

/**
 * @typedef {object} ComposableFetchResult
 * @property {ref} data
 * @property {ref} error
 *
 * @param {string} url
 * @returns {ComposableFetchResult}
 */
export function useFetch(url) {
  const data = ref({})
  const error = ref(null)

  fetch(url)
    .then((res) => res.json())
    .then((json) => (data.value = json))
    .catch((err) => (error.value = err))

  return { data, error }
}
