import { defineStore } from 'pinia'

import config from '@/config'
import type { GenericResponse } from '@/model/api'
import type { CmsPage } from '@/model/cms'
import CmsPagesAPI from '@/services/api/resources/CmsPagesAPI'

const cmsPagesAPI = new CmsPagesAPI()

export const useCmsPageStore = defineStore('cmsPage', {
  actions: {
    async fetchPageById(idOrSlug: string): Promise<CmsPage> {
      return await cmsPagesAPI.get({
        entityId: idOrSlug,
        authenticated: true
      })
    },
    // scoped to this site's topic — not the caller's own pages, so
    // multiple admins managing the same site see the same list
    async listSitePages(): Promise<CmsPage[]> {
      const topicId = config.website.cms?.topic_id
      const response: GenericResponse = await cmsPagesAPI.list({
        params: {
          ...(topicId ? { topic: topicId } : {}),
          sort: '-last_modified'
        },
        authenticated: true
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
    }
  }
})
