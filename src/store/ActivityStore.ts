import { defineStore } from 'pinia'

import type { ActivityResponse } from '@/model/activity'
import ActivityAPI from '@/services/api/resources/ActivityAPI'

const api = new ActivityAPI()

interface RootState {
  data: Record<string, ActivityResponse[]>
}

export const useActivityStore = defineStore('activity', {
  state: (): RootState => ({
    data: {}
  }),
  actions: {
    /**
     * Get activites for an object from store
     */
    getActivitiesForObject(objectId: string, page: number) {
      return this.data[objectId]?.find((d) => d.page === page)
    },
    /**
     * Async function to trigger API fetch of reuses for an object
     */
    async loadActivitiesForObject(objectId: string, page: number) {
      const existing = this.getActivitiesForObject(objectId, page)
      if (existing !== undefined) return existing
      const activities = await api.getActivitiesForObject(objectId, page)
      if (this.data[objectId]) {
        this.data[objectId].push(activities)
      } else {
        this.data[objectId] = [activities]
      }
      return this.getActivitiesForObject(objectId, page)
    },
    /**
     * Get pagination for object
     */
    getPaginationForObject(objectId: string) {
      const activities = this.getActivitiesForObject(objectId, 1)
      if (activities === undefined) return []
      const nbPages = Math.ceil(activities.total / activities.page_size)
      return [...Array(nbPages).keys()].map((page) => {
        page += 1
        return {
          label: page.toString(),
          href: '#',
          title: `Page ${page}`
        }
      })
    }
  }
})
