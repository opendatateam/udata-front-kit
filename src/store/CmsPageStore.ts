import { defineStore } from 'pinia'

import config from '@/config'
import type { GenericResponse } from '@/model/api'
import type { CmsPage } from '@/model/cms'
import CmsPagesAPI from '@/services/api/resources/CmsPagesAPI'
import { categoryTag } from '@/utils/cms'

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
    // multiple admins managing the same site see the same list.
    // with_drafts: admins manage unpublished pages too, not just live ones
    async listSitePages(): Promise<CmsPage[]> {
      const topicId = config.website.cms?.topic_id
      const response: GenericResponse = await cmsPagesAPI.list({
        params: {
          ...(topicId ? { topic: topicId } : {}),
          with_drafts: 'true',
          sort: '-last_modified'
        },
        authenticated: true
      })
      return response.data as CmsPage[]
    },
    // public, unauthenticated: only published pages (no with_drafts), for
    // front-of-site widgets like the homepage news list.
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
        }
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
