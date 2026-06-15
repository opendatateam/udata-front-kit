import { defineStore } from 'pinia'
import { computed, type ComputedRef } from 'vue'

import config from '@/config'
import type { BaseParams, GenericResponse } from '@/model/api'
import type { Topic } from '@/model/topic'
import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { useUniverseQuery } from '@/utils/universe'

import { useUserStore } from './UserStore'

const topicsAPI = new TopicsAPI({ version: 2 })

export interface RootState {
  topics: Topic[]
  drafts: Topic[]
  draftsTotal: number
}

export const useTopicStore = defineStore('topic', {
  state: (): RootState => ({
    topics: [],
    drafts: [],
    draftsTotal: 0
  }),
  getters: {
    myTopics(): ComputedRef<Topic[]> {
      const userStore = useUserStore()
      return computed(() => {
        if (!userStore.isLoggedIn) return []
        return this.topics.filter((topic: Topic) =>
          userStore.hasEditPermissions(topic)
        )
      })
    },
    draftsPagination() {
      const pageSize = config.website.pagination_sizes.topics_drafts_list
      const nbPages = Math.ceil(this.draftsTotal / pageSize)
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
    async loadDrafts({
      q,
      page = 1,
      pageKey,
      sort = '-last_modified'
    }: {
      q?: string
      page?: number
      pageKey: string
      sort?: string
    }): Promise<void> {
      const response: GenericResponse = await topicsAPI.list({
        params: {
          private: 'true',
          sort,
          page,
          page_size: config.website.pagination_sizes.topics_drafts_list,
          ...(q ? { q } : {}),
          ...useUniverseQuery(pageKey, {})
        },
        authenticated: true
      })
      this.drafts = response.data as Topic[]
      this.draftsTotal = response.total
    },
    /**
     * Load all topics from universe by following pagination links
     */
    async loadTopicsForUniverse(pageKey?: string): Promise<Topic[]> {
      const mergedApiParams = useUniverseQuery(pageKey || 'topics', {})
      // make sure our user has registerd its permissions
      await useUserStore().waitForStoreInit()
      let response = await topicsAPI.list({
        params: {
          // TODO: remove include_private when all servers migrated to private param
          include_private: 'true',
          sort: '-last_modified',
          ...mergedApiParams
        },
        authenticated: true
      })
      this.topics = response.data
      while (response.next_page !== null) {
        response = await topicsAPI.request({
          url: response.next_page,
          method: 'get',
          authenticated: true
        })
        this.topics = [...this.topics, ...response.data]
      }
      return this.topics
    },
    /**
     * Get a single topic from API
     */
    async load(slugOrId: string, params?: BaseParams): Promise<Topic> {
      return await topicsAPI.get({ entityId: slugOrId, ...params })
    },
    /**
     * Create a topic
     */
    async create(topicData: object): Promise<Topic> {
      return await topicsAPI.create({ data: topicData })
    },
    /**
     * Update a topic
     */
    async update(topicId: string, data: object): Promise<Topic> {
      return await topicsAPI.update({ entityId: topicId, data })
    },
    /**
     * Delete a topic
     */
    async delete(topicId: string) {
      topicsAPI.delete({ entityId: topicId })
    }
  }
})
