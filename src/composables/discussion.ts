import { storeToRefs } from 'pinia'
import { toValue, watch, watchEffect } from 'vue'
import type { Ref, ComputedRef, UnwrapRef } from 'vue'
import { toast } from 'vue3-toastify'
import { useLoading } from 'vue-loading-overlay'

import type { Discussion } from '@/model/discussion'
import type { ErrorParams } from '@/model/error'
import type { Loading, LoadingParams } from '@/model/loader'
import type { Page } from '@/model/page'
import { useDiscussionStore } from '@/store/DiscussionStore'

type Subject = () =>
  | Ref<UnwrapRef<Record<string, unknown>>>
  | ComputedRef<unknown>

interface Return {
  getDiscussions: ComputedRef<Discussion[]>
  discussionsPage: Ref<number>
  discussionsPages: ComputedRef<Page[]>
}

// setup loader
const loading: Loading = useLoading()
const loadingParams: LoadingParams = { canCancel: true, lockScroll: true }

// setup error
const errorParams: ErrorParams = { type: 'error', autoClose: false }

const useDiscussion = (subject: Subject): Return => {
  // setup store
  const discussionStore = useDiscussionStore()
  const {
    getDiscussions,
    discussionsPage,
    discussionsPages,
    error: discussionsError,
    loading: discussionsLoading
  } = storeToRefs(discussionStore)

  watch(discussionsError, (after: boolean, before: boolean): void => {
    if (after && !before) {
      const { errorValue } = discussionStore
      discussionStore.loading = false
      if (errorValue !== null) toast(errorValue, errorParams)
    }
  })

  watch(discussionsLoading, (after: boolean, before: boolean) => {
    if (after && !before) {
      discussionStore.loader = loading.show(loadingParams)
      return
    }
    if (!after && before && discussionStore.loader !== null) {
      discussionStore.loader.hide()
    }
  })

  // fetch discussions if there are any
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  watchEffect(async (): Promise<void> => {
    const subjectId = (toValue(subject()) as { id: string | undefined }).id
    if (subjectId === undefined) return
    await discussionStore.fetchDiscussions({ subjectId })
  })

  return { getDiscussions, discussionsPage, discussionsPages }
}

export { useDiscussion }
