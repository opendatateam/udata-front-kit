import { isEmpty } from 'lodash/fp'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { AppError, Page, Response } from '@/model/api'
import type { Discussion, SubjectId } from '@/model/discussion'
import { UnknownError } from '@/model/error'
import type { DataByPage, DataByUUID } from '@/model/store'
import { DiscussionsAPI } from '@/services/api/resources/DiscussionsAPI'
import { usePaginationStore } from '@/store/PaginationStore'

interface Params {
  subjectId: SubjectId
  page?: Page
}

type PaginationStore = ReturnType<typeof usePaginationStore>

const useDiscussionStore = defineStore('discussion', () => {
  const store: PaginationStore = usePaginationStore()
  const client = ref(new DiscussionsAPI()) as Ref<DiscussionsAPI>
  const data: Ref<DataByUUID<Discussion[]>> = ref({})
  const error: Ref<boolean> = ref(false)
  const errorMessage: Ref<string | null> = ref(null)
  const page: Ref<Page> = ref(1)
  const subjectId: Ref<SubjectId | undefined> = ref()
  const { dataCount, dataPerPage, pagination } = storeToRefs(store)

  /**
   * Get discussions for a subject and a page from store.
   */
  const get: ComputedRef<Discussion[]> = computed(() => {
    error.value = false
    errorMessage.value = null
    if (subjectId.value === undefined) return []
    return data.value[subjectId.value]?.[page.value] ?? []
  })

  /**
   * Store the result of a discussions' fetch operation for a subject in store.
   */
  function set({ items }: { items: Discussion[] }): Discussion[] {
    if (subjectId.value === undefined) {
      error.value = true
      errorMessage.value = `The property 'subjectId' is required.`
      return []
    }

    if (isEmpty(data.value[subjectId.value])) {
      data.value[subjectId.value] = {} satisfies DataByPage<Discussion[]>
    }

    if (isEmpty(items)) {
      data.value[subjectId.value][page.value] = [] satisfies Discussion[]
      return get.value
    }

    data.value[subjectId.value][page.value] = items

    return get.value
  }

  /**
   * Async function to trigger API fetch of discussions for a subject.
   */
  async function fetch(): Promise<Discussion[]> {
    if (subjectId.value === undefined) {
      error.value = true
      errorMessage.value = `The property 'subjectId' is required.`
      return []
    }

    if (!isEmpty(get.value)) {
      return get.value
    }

    const params: Params = {
      subjectId: subjectId.value,
      page: page.value
    }

    const response = await client.value.list(params)
    const { status } = response
    const { error: message } = response as AppError
    const { data } = response as Response<Discussion[]>

    if (status === 200 && data !== undefined) {
      error.value = false
      errorMessage.value = null
      page.value = data.page
      dataCount.value = data.total
      dataPerPage.value = data.pageSize
      return set({ items: data.data })
    }

    if (status === 404 || status === 500) {
      error.value = true
      errorMessage.value = message
      return []
    }

    throw new UnknownError({ error: message })
  }

  return {
    client,
    data,
    dataCount,
    dataPerPage,
    error,
    errorMessage,
    get,
    fetch,
    page,
    pagination,
    set,
    subjectId
  }
})

export { useDiscussionStore }
