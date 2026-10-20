import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'

import type {
  CommentForm,
  Discussion,
  DiscussionForm,
  DiscussionId,
  DiscussionResponse,
  SubjectId
} from '@/model/discussion'
import DiscussionsAPI from '@/services/api/resources/DiscussionsAPI'

const discussionsAPI = new DiscussionsAPI()

/** Current page of discussions for a subject, with its mutations */
export const useDiscussions = (subjectId: Ref<SubjectId>) => {
  const currentPage = ref(1)
  const discussions: Ref<DiscussionResponse | undefined> = ref()
  const closedCount: Ref<number | undefined> = ref()

  let loading: Promise<void> = Promise.resolve()
  let lastRequest = 0

  const fetchPage = async () => {
    const request = ++lastRequest
    const res = await discussionsAPI.getDiscussions(
      subjectId.value,
      currentPage.value
    )
    // Drop responses superseded by a later request (e.g. fast page changes)
    if (request !== lastRequest) return
    if (!res.data.length && currentPage.value > 1) {
      currentPage.value -= 1
      return
    }
    discussions.value = res
  }

  const refreshClosedCount = async () => {
    const id = subjectId.value
    const count = await discussionsAPI.getClosedCount(id)
    if (id === subjectId.value) closedCount.value = count
  }

  const reload = (): Promise<void> => {
    loading = Promise.all([fetchPage(), refreshClosedCount()]).then(() => {})
    return loading
  }

  watch(currentPage, () => {
    loading = fetchPage()
  })

  const reloadFirstPage = async () => {
    if (currentPage.value === 1) return await reload()
    // Changing page triggers the page fetch through the watcher
    currentPage.value = 1
    await refreshClosedCount()
  }

  watch(subjectId, (id) => id && reloadFirstPage(), { immediate: true })

  const pages = computed(() => {
    if (!discussions.value) return []
    const { total, page_size } = discussions.value
    return Array.from({ length: Math.ceil(total / page_size) }, (_, i) => ({
      label: `${i + 1}`,
      href: '#',
      title: `Page ${i + 1}`
    }))
  })

  const replaceDiscussion = (discussion: Discussion) => {
    if (!discussions.value) return
    discussions.value.data = discussions.value.data.map((d) =>
      d.id === discussion.id ? discussion : d
    )
  }

  const createDiscussion = async (form: DiscussionForm) => {
    const discussion: Discussion = await discussionsAPI.create({ data: form })
    await reloadFirstPage()
    return discussion
  }

  const createComment = async (
    discussionId: DiscussionId,
    form: CommentForm
  ) => {
    const discussion = await discussionsAPI.createComment(discussionId, form)
    replaceDiscussion(discussion)
    if (discussion.closed) await refreshClosedCount()
    return discussion
  }

  const updateDiscussionTitle = async (
    discussionId: DiscussionId,
    title: string
  ) => {
    replaceDiscussion(
      await discussionsAPI.updateDiscussion(discussionId, title)
    )
  }

  const updateComment = async (
    discussionId: DiscussionId,
    commentId: string,
    comment: string
  ) => {
    replaceDiscussion(
      await discussionsAPI.updateComment(discussionId, commentId, comment)
    )
  }

  const deleteDiscussion = async (discussionId: DiscussionId) => {
    await discussionsAPI.deleteDiscussion(discussionId)
    await reload()
  }

  const deleteComment = async (
    discussionId: DiscussionId,
    commentId: string
  ) => {
    await discussionsAPI.deleteComment(discussionId, commentId)
    const discussion = discussions.value?.data.find(
      (d) => d.id === discussionId
    )
    if (!discussion) return
    replaceDiscussion({
      ...discussion,
      discussion: discussion.discussion.filter((c) => c.id !== commentId)
    })
  }

  return {
    currentPage,
    discussions,
    closedCount,
    pages,
    // Resolves once the in-flight load is done
    loaded: () => loading,
    createDiscussion,
    createComment,
    updateDiscussionTitle,
    updateComment,
    deleteDiscussion,
    deleteComment
  }
}
