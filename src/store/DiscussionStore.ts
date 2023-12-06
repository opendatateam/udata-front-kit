import { defineStore, storeToRefs } from 'pinia'
import { computed, toValue, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { AppError, Meta, Page, Response } from '@/model/api'
import type { Discussion, SubjectId } from '@/model/discussion'
import type { Loader } from '@/model/loader'
import type { Data, DataByPage, DataByUUID } from '@/model/store'
import { DiscussionsAPI } from '@/services/api/resources/DiscussionsAPI'
import { usePaginationStore } from '@/store/PaginationStore'

interface SetParams extends FetchParams {
  items: Discussion[]
  meta: Meta
}

interface FetchParams {
  subjectId: SubjectId
}

interface ErrorMsgParams {
  type: string | number | undefined
  value: string
}

const metaError: Meta = { page: 1, pageSize: 0, total: 0 }

const useDiscussionStore = defineStore('discussion', () => {
  const {
    dataCount: discussionsCount,
    dataPerPage: discussionsPerPage,
    pages: discussionsPages
  } = storeToRefs(usePaginationStore())
  const client = ref(new DiscussionsAPI()) as Ref<DiscussionsAPI>
  const discussions: Ref<DataByUUID<Discussion[]>> = ref({})
  const discussionsPage: Ref<Page> = ref(1)
  const error: Ref<boolean> = ref(false)
  const errorType: Ref<string | number | null | undefined> = ref(null)
  const errorValue: Ref<string | null> = ref(null)
  const loader: Ref<Loader | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const subjectId: Ref<SubjectId | undefined> = ref()

  /**
   * Get discussions for a subject and a page from store.
   */
  const getDiscussions: ComputedRef<Discussion[]> = computed(() => {
    resetError()
    if (toValue(subjectId) === undefined) return []
    const data: Data<Discussion[]> | undefined = toValue(getData)
    const items: Discussion[] | undefined = data?.items
    return items ?? []
  })

  /**
   * Get data containing discussions and metadata.
   */
  const getData: ComputedRef<Data<Discussion[]> | undefined> = computed(() => {
    const id = toValue(subjectId)
    if (id === undefined) return
    const byUUID: DataByUUID<Discussion[]> = toValue(discussions)
    const byPage: DataByPage<Discussion[]> | undefined = byUUID[id]
    return byPage?.[toValue(discussionsPage)]
  })

  /**
   * Store the result of a discussions' fetch operation for a subject in store.
   */
  function setDiscussions({ subjectId: id, items, meta }: SetParams): void {
    if (id === undefined) {
      errorMsg({ type: 'ValueError', value: 'subjectId' })
      return
    } else subjectId.value = id

    if (items === undefined) {
      errorMsg({ type: 'ValueError', value: 'items' })
      return
    }

    if (meta === undefined) {
      errorMsg({ type: 'ValueError', value: 'meta' })
      return
    }

    if (toValue(discussionsPage) !== meta.page) {
      discussionsPage.value = meta.page
    }

    const page: number = toValue(discussionsPage)
    const data: DataByUUID<Discussion[]> = toValue(discussions)

    if (data[id] === undefined) {
      discussions.value[id] = {} satisfies DataByPage<Discussion[]>
    }

    discussions.value[id][page] = { items, meta } satisfies Data<Discussion[]>

    resetError()
  }

  /**
   * Async function to trigger API fetch of discussions for a subject.
   */
  async function fetchDiscussions({
    subjectId: id
  }: FetchParams): Promise<void> {
    loading.value = true

    if (id === undefined) {
      errorMsg({ type: 'ValueError', value: 'subjectId' })
      paginate(metaError)
      loading.value = false
      return
    }

    if (toValue(subjectId) !== id) {
      discussionsPage.value = 1
      subjectId.value = id
    }

    const page: number = toValue(discussionsPage)
    const data: Data<Discussion[]> | undefined = toValue(getData)

    if (data?.items !== undefined && data.meta !== undefined) {
      const { items, meta } = data
      setDiscussions({ subjectId: id, items, meta })
      paginate(meta)
      resetError()
      loading.value = false
      return
    }

    const request = toValue(client).list({ subjectId: id, page })
    const response: Response<Discussion[]> | AppError = await request
    const { status } = response
    const { error: message } = response as AppError
    const { data: body } = response as Response<Discussion[]>

    if (status === 200 && body !== undefined) {
      const { data: items, page, total, pageSize } = body
      const meta: Meta = { page, pageSize, total }
      setDiscussions({ subjectId: id, items, meta })
      paginate(meta)
      resetError()
      loading.value = false
      return
    }

    if (status === 404 || status === 500 || typeof status === 'string') {
      errorMsg({ type: status.toString(), value: message })
      paginate(metaError)
      loading.value = false
      return
    }

    errorMsg({ type: status, value: message })
    paginate(metaError)
    loading.value = false
  }

  /**
   * Error message.
   */
  function errorMsg({ type, value }: ErrorMsgParams): void {
    error.value = true
    errorType.value = type
    errorValue.value = value
  }

  /**
   * Trigger the pagination.
   */
  function paginate({ page, pageSize, total }: Meta): void {
    discussionsPage.value = page
    discussionsPerPage.value = pageSize
    discussionsCount.value = total
  }
  /**
   * Reset contextual state.
   */
  function resetError(): void {
    error.value = false
    errorType.value = null
    errorValue.value = null
  }

  return {
    client,
    discussions,
    discussionsCount,
    discussionsPage,
    discussionsPages,
    discussionsPerPage,
    error,
    errorType,
    errorValue,
    fetchDiscussions,
    getDiscussions,
    loader,
    loading,
    paginate,
    resetError,
    setDiscussions,
    subjectId
  }
})

export { useDiscussionStore }
