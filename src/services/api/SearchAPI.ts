import { toast } from 'vue3-toastify'
import { useLoading } from 'vue-loading-overlay'

import config from '@/config'

import DatagouvfrAPI from './DatagouvfrAPI'
import type { ResponseDataPromise as ResponseData } from './DatagouvfrAPI'

const $loading = useLoading()

/**
 * A wrapper around search engine API
 */
export default class SearchAPI extends DatagouvfrAPI {
  version = '2'
  endpoint = 'datasets/search'

  // FIXME: why wrap Promise in Promise? Type it w/ Search anyway
  async _search(
    query: string,
    topic: string,
    page: number,
    args?: object
  ): Promise<ResponseData> {
    return await this.request({
      url: this.url(true),
      method: 'get',
      params: {
        topic: topic ?? config.universe.topic_id,
        page: page ?? 1,
        q: query ?? '',
        ...args
      }
    })
  }

  // FIXME: use toasted from above
  async search(
    query: string,
    topic: string,
    page: number,
    args?: object
  ): Promise<ResponseData> {
    const loader = $loading.show()
    return await this._search(query, topic, page, args)
      .catch((err) => {
        toast(err.message, { type: 'error', autoClose: false })
      })
      .finally(() => {
        loader.hide()
      })
  }
}
