import { useLoading } from "vue-loading-overlay"
import { toast } from "vue3-toastify"
import DatagouvfrAPI from "./DatagouvfrAPI"
import config from "@/config"

const $loading = useLoading()

/**
 * A wrapper around search engine API
 */
export default class SearchAPI extends DatagouvfrAPI{
  version = "2"
  endpoint = "datasets/search"

  _search(query, args) {
    args = args || {}
    args.topic = args.topic || config.universe_topic_id
    args.q = query || ""
    const qs = new URLSearchParams(args).toString()
    const url = `${this.url()}/?${qs}`
    return this.request(url)
  }

  search (query, args) {
    const loader = $loading.show()
    return this._search(query, args).catch(err => {
      toast(err.message, {type: "error", autoClose: false})
    }).finally(() => loader.hide())
  }
}
