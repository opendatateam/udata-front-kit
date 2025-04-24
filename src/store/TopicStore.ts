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

const topicsAPI = new TopicsAPI()
const topicsAPIv2 = new TopicsAPI({ version: 2 })

interface QueryArgs {
  query: string
  page: string
  include_private?: string
  page_size?: string
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

      const results = await topicsAPIv2.list({
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
        const res = await topicsAPIv2.get({ entityId: topic.id })
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
      let response = await topicsAPIv2.list({
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
        response = await topicsAPIv2.request({
          url: response.next_page,
          method: 'get'
        })
        this.topics = [...this.topics, ...response.data]
      }
      return this.topics
    },
    /**
     * Get a single topic from API
     */
    async load(slugOrId: string, params?: BaseParams): Promise<Topic> {
      return await topicsAPIv2.get({ entityId: slugOrId, ...params })
    },
    /**
     * Create a topic
     * WARNING: returns a V1 payload
     */
    async create(topicData: object): Promise<Topic> {
      return await topicsAPI.create({ data: topicData })
    },
    /**
     * Update a topic
     * WARNING: returns a V1 payload
     */
    async update(topicId: string, data: object): Promise<Topic> {
      return await topicsAPI.update({ entityId: topicId, data })
    },
    /**
     * Delete a topic
     */
    async delete(topicId: string) {
      await topicsAPI.delete({ entityId: topicId })
    }
  }
})
