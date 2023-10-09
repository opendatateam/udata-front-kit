import { MeiliSearch } from 'meilisearch'
import { useLoading } from 'vue-loading-overlay'
import { toast } from 'vue3-toastify'

const $loading = useLoading()

/**
 * A wrapper around search engine API
 */
export default class SearchAPI {
  constructor() {
    const host = import.meta.env.VITE_SEARCH_ENGINE_URL
    const apiKey = import.meta.env.VITE_SEARCH_ENGINE_PUBLIC_KEY
    const client = new MeiliSearch({ host, apiKey })
    this.index = client.index('datasets')
  }

  _search(query, args) {
    return this.index.search(query, args)
  }

  search(query, args) {
    const loader = $loading.show()
    return this._search(query, args)
      .catch((err) => {
        toast(err.message, { type: 'error', autoClose: false })
      })
      .finally(() => loader.hide())
  }
}
