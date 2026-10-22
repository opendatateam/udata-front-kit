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
  let lastRequest = 0

  const fetchPage = async () => {
    const request = ++lastRequest
    const res = await discussionsAPI.getDiscussions(
      subjectId.value,
      currentPage.value
    )
    // Drop responses superseded by a later request (e.g. fast page changes)
    if (request !== lastRequest) return
    // Page emptied (e.g. last item deleted): step back, the watcher fetches it
    if (!res.data.length && currentPage.value > 1) {
      currentPage.value -= 1
      return
    }
    discussions.value = res
  }

  let lastCountRequest = 0

  const refreshClosedCount = async () => {
    const request = ++lastCountRequest
    const count = await discussionsAPI.getClosedCount(subjectId.value)
    // Drop responses superseded by a later request
    if (request !== lastCountRequest) return
    closedCount.value = count
  }

  const reload = (): Promise<void> => {
    return Promise.all([fetchPage(), refreshClosedCount()]).then(() => {})
  }

  const reloadFirstPage = async () => {
    if (currentPage.value === 1) return await reload()
    // Changing page triggers the page fetch through the watcher
    currentPage.value = 1
    await refreshClosedCount()
  }

  const pages = computed(() => {
    if (!discussions.value) return []
    const { total, page_size } = discussions.value
    return Array.from({ length: Math.ceil(total / page_size) }, (_, i) => ({
      label: `${i + 1}`,
      href: '#',
      title: `Page ${i + 1}`
    }))
  })

  // Discussion fetched on its own (deep link), independently of pagination
  const selectedDiscussion: Ref<Discussion | null> = ref(null)

  // Undefined if the discussion doesn't exist or belongs to another subject
  const fetchDiscussion = async (
    discussionId: DiscussionId
  ): Promise<Discussion | undefined> => {
    const discussion = await discussionsAPI
      .getDiscussion(discussionId)
      .catch(() => undefined)
    return discussion?.subject.id === subjectId.value ? discussion : undefined
  }

  const findDiscussion = (discussionId: DiscussionId) =>
    selectedDiscussion.value?.id === discussionId
      ? selectedDiscussion.value
      : discussions.value?.data.find((d) => d.id === discussionId)

  const replaceDiscussion = (discussion: Discussion) => {
    if (selectedDiscussion.value?.id === discussion.id)
      selectedDiscussion.value = discussion
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
    const discussion = findDiscussion(discussionId)
    if (!discussion) return
    replaceDiscussion({
      ...discussion,
      discussion: discussion.discussion.filter((c) => c.id !== commentId)
    })
  }

  watch(currentPage, () => {
    fetchPage()
  })
  // Subject can change with the same composable used (e.g. TopicDetail swaps the Topic)
  watch(
    subjectId,
    (id) => {
      if (!id) return
      // Clear the previous subject's data while the new one loads
      discussions.value = undefined
      closedCount.value = undefined
      reloadFirstPage()
    },
    { immediate: true }
  )

  return {
    currentPage,
    discussions,
    closedCount,
    pages,
    selectedDiscussion,
    fetchDiscussion,
    createDiscussion,
    createComment,
    updateDiscussionTitle,
    updateComment,
    deleteDiscussion,
    deleteComment
  }
}
