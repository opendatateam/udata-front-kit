import { defineStore } from 'pinia'

import config from '@/config'
import type { GenericResponse } from '@/model/api'
import type { CmsPage } from '@/model/cms'
import type { Topic } from '@/model/topic'
import CmsPagesAPI from '@/services/api/resources/CmsPagesAPI'
import { useTopicStore } from '@/store/TopicStore'
import { categoryTag } from '@/utils/cms'

const cmsPagesAPI = new CmsPagesAPI()

export interface CmsPageStoreState {
  sitePages: CmsPage[]
  sitePagesTotal: number
  cmsTopic: Topic | null
}

export const useCmsPageStore = defineStore('cmsPage', {
  state: (): CmsPageStoreState => ({
    sitePages: [],
    sitePagesTotal: 0,
    cmsTopic: null
  }),
  getters: {
    sitePagesPagination() {
      const pageSize = config.website.pagination_sizes.cms_pages_list
      const nbPages = Math.ceil(this.sitePagesTotal / pageSize)
      return [...Array(nbPages).keys()].map((page) => {
        page += 1
        return {
          label: page.toString(),
          href: '#',
          title: `Page ${page}`
        }
      })
    }
  },
  actions: {
    // caches the CMS topic in state so repeat calls skip the fetch
    async loadCmsTopic(): Promise<Topic | null> {
      if (this.cmsTopic !== null) return this.cmsTopic
      const topicId = config.website.cms?.topic_id
      if (!topicId) return null
      try {
        this.cmsTopic = await useTopicStore().load(topicId, {
          authenticated: true
        })
      } catch {
        return null
      }
      return this.cmsTopic
    },
    async fetchPageById(idOrSlug: string): Promise<CmsPage> {
      return await cmsPagesAPI.get({
        entityId: idOrSlug,
        authenticated: true
      })
    },
    // scoped to this site's topic — not the caller's own pages, so
    // multiple admins managing the same site see the same list.
    // with_drafts: admins manage unpublished pages too, not just live ones
    async listSitePages(page = 1): Promise<void> {
      const topicId = config.website.cms?.topic_id
      const response: GenericResponse = await cmsPagesAPI.list({
        params: {
          ...(topicId ? { topic: topicId } : {}),
          with_drafts: 'true',
          sort: '-last_modified',
          page,
          page_size: config.website.pagination_sizes.cms_pages_list
        },
        authenticated: true
      })
      this.sitePages = response.data as CmsPage[]
      this.sitePagesTotal = response.total
    },
    // public, unauthenticated: only published pages (no with_drafts), for
    // front-of-site widgets like the homepage news list.
    // toasted: false — this is a non-critical widget, a fetch failure shouldn't
    // surface an error toast to every site visitor.
    async listPublishedByCategory(
      categoryId: string,
      limit?: number
    ): Promise<CmsPage[]> {
      const topicId = config.website.cms?.topic_id
      const response: GenericResponse = await cmsPagesAPI.list({
        params: {
          ...(topicId ? { topic: topicId } : {}),
          tag: categoryTag(categoryId),
          sort: '-published',
          ...(limit ? { page_size: limit } : {})
        },
        toasted: false
      })
      return response.data as CmsPage[]
    },
    async createPage(data: object): Promise<CmsPage> {
      return await cmsPagesAPI.create({ data })
    },
    async updatePage(pageId: string, data: object): Promise<CmsPage> {
      return await cmsPagesAPI.update({ entityId: pageId, data })
    },
    async deletePage(pageId: string): Promise<void> {
      await cmsPagesAPI.delete({ entityId: pageId })
    },
    async publishPage(pageId: string): Promise<CmsPage> {
      return await cmsPagesAPI.publish(pageId)
    },
    async unpublishPage(pageId: string): Promise<void> {
      await cmsPagesAPI.unpublish(pageId)
    }
  }
})
