import { MeiliSearch } from "meilisearch"

/**
 * A wrapper around search engine API
 */
export default class SearchAPI {
  constructor () {
    const host = import.meta.env.VITE_SEARCH_ENGINE_URL
    const apiKey = import.meta.env.VITE_SEARCH_ENGINE_PUBLIC_KEY
    const client = new MeiliSearch({host, apiKey})
    return client.index("datasets")
  }
}
