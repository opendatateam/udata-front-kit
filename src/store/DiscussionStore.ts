import { isEmpty } from 'lodash/fp'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

import type { Response, Pagination, Discussion, Page, Data } from '@/model'
import DiscussionsAPI from '@/services/api/resources/DiscussionsAPI'

const { getDiscussions } = new DiscussionsAPI()

interface Args {
  subjectId: string
  page?: number
  discussions?: Discussion[]
}

function useDiscussion() {
  const data: Ref<Data<Discussion[]>> = ref<Data<Discussion[]>>({})
  const pageSize: Ref<number> = ref<number>(1)
  const discussionTotal: Ref<number> = ref<number>(0)

  const pageRange: ComputedRef<number[]> = computed<number[]>(() => {
    return [...Array(pageTotal).keys()].map((page) => page + 1)
  })

  const pageTotal: ComputedRef<number> = computed<number>(() => {
    return Math.ceil(discussionTotal.value / pageSize.value)
  })

  /**
   * Get discussions for a subject from store.
   *
   * @param {Args}
   * @returns {Discussion[]}
   */
  function getDiscussionsForSubject({
    subjectId,
    page = 1
  }: Args): Discussion[] {
    const discussions: Page<Discussion[]> = data.value[subjectId]
    if (isEmpty(discussions)) return []
    return discussions[page] ?? []
  }

  /**
   * Async function to trigger API fetch of discussions for a subject.
   *
   * @param {Args}
   * @returns {Promise<Discussion[]>}
   */
  async function loadDiscussionsForSubject({
    subjectId,
    page = 1
  }: Args): Promise<Discussion[]> {
    const existing: Discussion[] = getDiscussionsForSubject({
      subjectId,
      page
    })

    if (!isEmpty(existing)) return existing

    const { data }: Response<Discussion[]> = await getDiscussions({
      subjectId,
      page
    })

    pageSize.value = data?.page_size ?? pageSize.value
    discussionTotal.value = data?.total ?? discussionTotal.value
    const discussions: Discussion[] = data?.data ?? []
    addDiscussions({ subjectId, page, discussions })
    return getDiscussionsForSubject({ subjectId, page })
  }

  /**
   * Store the result of a discussions' fetch operation for a subject in store.
   *
   * @param {Args}
   */
  function addDiscussions({ subjectId, page, discussions }: Args): void {
    if (page === undefined) throw Error('Page is required!')
    if (discussions === undefined) throw Error('Discussions is required!')
    if (isEmpty(data.value[subjectId])) data.value[subjectId] = {}
    data.value[subjectId][page] = discussions
  }

  /**
   * Get a discussions' pagination object for a given subject from store.
   *
   * @param {Args}
   * @returns {Pagination[]}
   */
  function getDiscussionsPaginationForSubject({
    subjectId
  }: Args): Pagination[] {
    const discussions: Discussion[] = getDiscussionsForSubject({ subjectId })

    if (!isEmpty(discussions)) return []

    return pageRange.value.map((page) => {
      return {
        label: page,
        href: '#',
        title: `Page ${page}`
      }
    })
  }

  return {
    loadDiscussionsForSubject,
    getDiscussionsPaginationForSubject
  }
}

export const useDiscussionStore = defineStore('discussion', useDiscussion)
