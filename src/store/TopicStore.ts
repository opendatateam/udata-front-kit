import { AxiosError } from 'axios'
import { defineStore } from 'pinia'
import { computed, type ComputedRef } from 'vue'

import config from '@/config'
import type { BaseParams } from '@/model/api'
import type { TopicItemConf } from '@/model/config'
import type { Topic } from '@/model/topic'
import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { useCheckboxQuery } from '@/utils/filters'
import { useTagsQuery } from '@/utils/tags'
import { useUniverseQuery } from '@/utils/universe'

import { useUserStore } from './UserStore'

const topicsAPI = new TopicsAPI({ version: 2 })

interface QueryArgs {
  query: string
  page: string
  include_private?: string
  page_size?: string
  featured?: string
}

export interface RootState {
  topics: Topic[]
  total: number
}

export const useTopicStore = defineStore('topic', {
  state: (): RootState => ({
    topics: [],
    total: 0
  }),
  getters: {
    // Computed property to get topics writable by the current user
    myTopics(): ComputedRef<Topic[]> {
      const userStore = useUserStore()
      return computed(() => {
        if (!userStore.isLoggedIn) return []
        return this.topics.filter((topic: Topic) =>
          userStore.hasEditPermissions(topic)
        )
      })
    },
    pagination() {
      const nbPages = Math.ceil(
        this.total / config.website.pagination_sizes.topics_list
      )
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
    async query(args: QueryArgs, pageKey?: string): Promise<Topic[]> {
      const { query, ...queryArgs } = args

      // extract tags and checkbox filters from query args
      const { extraArgs: argsAfterTagQuery, tags } = useTagsQuery(
        pageKey || 'topics',
        queryArgs
      )
      const { extraArgs: refinedFilterArgs, checkboxArgs } = useCheckboxQuery(
        pageKey || 'topics',
        argsAfterTagQuery
      )
      const { tagsWithUniverse, universeQuery } = useUniverseQuery(
        pageKey || 'topics',
        tags
      )

      const results = await topicsAPI.list({
        params: {
          q: query,
          tag: tagsWithUniverse,
          page_size: config.website.pagination_sizes.topics_list,
          ...universeQuery,
          ...checkboxArgs,
          ...refinedFilterArgs
        },
        authenticated: true
      })
      this.topics = results.data
      this.total = results.total
      return this.topics
    },
    /**
     * Load topics to store from a list of ids and API
     */
    async loadTopicsFromList(topics: TopicItemConf[]): Promise<Topic[]> {
      this.topics = []
      for (const topic of topics) {
        const res = await topicsAPI.get({ entityId: topic.id })
        this.topics.push(res)
      }
      return this.topics
    },
    /**
     * Load all topics from universe by following pagination links
     */
    async loadTopicsForUniverse(pageKey?: string): Promise<Topic[]> {
      const { tagsWithUniverse, universeQuery } = useUniverseQuery(
        pageKey || 'topics',
        []
      )
      // make sure our user has registerd its permissions
      await useUserStore().waitForStoreInit()
      let response = await topicsAPI.list({
        params: {
          tag: tagsWithUniverse,
          include_private: 'yes',
          sort: '-last_modified',
          ...universeQuery
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
    // FIXME: temporary fallback on api v1, remove after API is migrated to elements
    async withVersionFallback<T>(
      apiCall: (api: TopicsAPI, toasted: boolean) => Promise<T>
    ): Promise<T> {
      try {
        return await apiCall(topicsAPI, false)
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 405) {
          const v1Api = new TopicsAPI({ version: 1 })
          console.log('fallback, v1 API used', v1Api)
          return await apiCall(v1Api, true)
        }
        throw err
      }
    },
    /**
     * Create a topic
     */
    async create(topicData: object): Promise<Topic> {
      return await this.withVersionFallback((api, toasted) =>
        api.create({ data: topicData, toasted })
      )
    },
    /**
     * Update a topic
     */
    async update(topicId: string, data: object): Promise<Topic> {
      return await this.withVersionFallback((api, toasted) =>
        api.update({ entityId: topicId, data, toasted })
      )
    },
    /**
     * Delete a topic
     */
    async delete(topicId: string) {
      await this.withVersionFallback((api, toasted) =>
        api.delete({ entityId: topicId, toasted })
      )
    }
  }
})
