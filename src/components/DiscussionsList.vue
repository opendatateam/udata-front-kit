<script setup lang="ts">
import type { Owned } from '@datagouv/components-next'
import { CopyButton } from '@datagouv/components-next'
import { storeToRefs } from 'pinia'
import type { PropType, Ref } from 'vue'
import { computed, nextTick, ref, toRef, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BlankState from '@/components/BlankState.vue'
import DiscussionAuthor from '@/components/DiscussionAuthor.vue'
import DiscussionCommentMeta from '@/components/DiscussionCommentMeta.vue'
import DiscussionItemActions from '@/components/DiscussionItemActions.vue'
import DiscussionMessageForm from '@/components/DiscussionMessageForm.vue'
import config from '@/config'
import type {
  Comment,
  Discussion,
  DiscussionForm,
  DiscussionId,
  SubjectClass
} from '@/model/discussion'
import { useCurrentPageConf } from '@/router/utils'
import LocalStorageService from '@/services/LocalStorageService'
import { useUserStore } from '@/store/UserStore'
import { formatDate } from '@/utils'
import { useDiscussions } from '@/utils/discussion'
import { Tab } from '@/utils/tabs'

const route = useRoute()
const router = useRouter()

const userStore = useUserStore()

const { pageKey, pageConf } = useCurrentPageConf()

const { loggedIn } = storeToRefs(userStore)

// Object the discussions are attached to (dataset, topic…); owner/organization identify its producer
type DiscussionSubject = Owned & { id: string; slug?: string }

const props = defineProps({
  subject: {
    type: Object as PropType<DiscussionSubject>,
    required: true
  },
  subjectClass: {
    type: String as () => SubjectClass,
    default: 'Dataset'
  },
  emptyMessage: {
    type: String,
    default: "Il n'y a pas encore de discussion pour ce jeu de données."
  }
})

const {
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
} = useDiscussions(toRef(() => props.subject.id))

// Undefined until loaded, so parents can fall back to their own count
const total = computed(() => discussions.value?.total)

const selectedDiscussionId = computed(() => {
  const id = route.query.discussion_id
  return typeof id === 'string' ? id : undefined
})

const header = useTemplateRef('header')

// only the selected discussion while one is deeplinked (empty until loaded)
const shownDiscussions = computed(() => {
  if (selectedDiscussionId.value) {
    return selectedDiscussion.value ? [selectedDiscussion.value] : []
  }
  return discussions.value?.data ?? []
})

// Only one form can be open at a time, so they all share the same data
interface FormData {
  title: string
  comment: string
  organization: string | null
}

const formData: Ref<FormData> = ref({
  title: '',
  comment: '',
  organization: null
})

type ActiveForm =
  | { kind: 'newDiscussion' }
  | { kind: 'reply'; discussionId: DiscussionId }
  | { kind: 'editDiscussion'; discussionId: DiscussionId }
  | { kind: 'editComment'; discussionId: DiscussionId; commentId: string }

const activeForm: Ref<ActiveForm | null> = ref(null)

// id is the comment id for editComment, the discussion id otherwise
const isFormOpen = (kind: ActiveForm['kind'], id?: string): boolean => {
  const form = activeForm.value
  if (form?.kind !== kind) return false
  if (form.kind === 'newDiscussion') return true
  if (form.kind === 'editComment') return form.commentId === id
  return form.discussionId === id
}

const openForm = (form: ActiveForm, data: Partial<FormData> = {}) => {
  formData.value = { title: '', comment: '', organization: null, ...data }
  activeForm.value = form
}

const closeForm = () => {
  activeForm.value = null
}

// Omits the organization when posting as yourself
const organizationPayload = () =>
  formData.value.organization
    ? { organization: formData.value.organization }
    : {}

const expandedDiscussions: Ref<Set<DiscussionId>> = ref(new Set())
const toggleDiscussionExpansion = (discussionId: DiscussionId) => {
  if (expandedDiscussions.value.has(discussionId)) {
    expandedDiscussions.value.delete(discussionId)
  } else {
    expandedDiscussions.value.add(discussionId)
  }
}

const discussionsCountLabel = computed(() => {
  const count = total.value ?? 0
  const totalLabel = count > 1 ? `${count} discussions` : `${count} discussion`
  if (!closedCount.value) return totalLabel
  const closedLabel =
    closedCount.value > 1
      ? `${closedCount.value} clôturées`
      : `${closedCount.value} clôturée`
  return `${totalLabel} dont ${closedLabel}`
})

const allowDiscussionCreation = pageConf.resources_tabs.discussions.create

// If configured, construct an external notification url from canonical_url for udata to use
const getNotificationExternalUrl = (): string | null => {
  if (!pageConf.resources_tabs.discussions.notify_url_override) return null
  const canonicalUrl = config.website.seo?.canonical_url
  if (!canonicalUrl) return null
  const slug = props.subject.slug
  if (!slug) return null
  const path = router.resolve({
    name: `${pageKey}_detail`,
    params: { item_id: slug, tab: Tab.DISCUSSIONS }
  }).href
  return `${canonicalUrl}${path}`
}

const isProducer = (comment: Comment): boolean => {
  if (props.subject.owner && !comment.posted_by_organization) {
    return props.subject.owner.id === comment.posted_by.id
  }
  if (props.subject.organization && comment.posted_by_organization) {
    return props.subject.organization.id === comment.posted_by_organization.id
  }
  return false
}

const triggerLogin = () => {
  LocalStorageService.setItem('lastRoute', route.fullPath)
  router.push({ name: 'login' })
}

const openNewDiscussionForm = () => openForm({ kind: 'newDiscussion' })

const submitDiscussion = () => {
  const externalUrl = getNotificationExternalUrl()
  const payload: DiscussionForm = {
    title: formData.value.title,
    comment: formData.value.comment,
    subject: { id: props.subject.id, class: props.subjectClass },
    ...organizationPayload(),
    ...(externalUrl
      ? { extras: { notification: { external_url: externalUrl } } }
      : {})
  }
  createDiscussion(payload).then(closeForm)
}

const openReplyForm = (discussionId: DiscussionId) =>
  openForm({ kind: 'reply', discussionId })

const submitComment = (discussionId: DiscussionId, close = false) => {
  createComment(discussionId, {
    comment: formData.value.comment,
    ...organizationPayload(),
    close
  }).then(closeForm)
}

const openEditDiscussionForm = (discussion: Discussion) =>
  openForm(
    { kind: 'editDiscussion', discussionId: discussion.id },
    { title: discussion.title, comment: discussion.discussion[0].content }
  )

const submitEditDiscussion = async (discussion: Discussion) => {
  const firstComment = discussion.discussion[0]
  try {
    if (formData.value.title !== discussion.title) {
      await updateDiscussionTitle(discussion.id, formData.value.title)
    }
    // Title and first-comment content live on two separate udata endpoints,
    // so changing both takes two requests.
    if (formData.value.comment !== firstComment.content) {
      await updateComment(
        discussion.id,
        firstComment.id,
        formData.value.comment
      )
    }
  } catch {
    // Toasted by the API layer; keep the form open so the user can retry.
    return
  }
  closeForm()
}

const confirmDeleteDiscussion = (discussion: Discussion) => {
  if (
    !window.confirm(
      'Êtes-vous sûr de vouloir supprimer cette discussion et tous ses commentaires ?'
    )
  )
    return
  deleteDiscussion(discussion.id).then(() => {
    if (selectedDiscussionId.value === discussion.id) {
      router.replace(allDiscussionsRoute.value)
    }
  })
}

const openEditCommentForm = (discussionId: DiscussionId, comment: Comment) =>
  openForm(
    { kind: 'editComment', discussionId, commentId: comment.id },
    { comment: comment.content }
  )

const submitEditComment = async () => {
  const form = activeForm.value
  if (form?.kind !== 'editComment') return
  await updateComment(form.discussionId, form.commentId, formData.value.comment)
  closeForm()
}

const confirmDeleteComment = (
  discussionId: DiscussionId,
  commentId: string
) => {
  if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?'))
    return
  if (isFormOpen('editComment', commentId)) closeForm()
  deleteComment(discussionId, commentId)
}

const discussionPermalink = (discussionId: DiscussionId) => {
  const { href } = router.resolve({
    name: route.name,
    params: { ...route.params, tab: Tab.DISCUSSIONS },
    query: { discussion_id: discussionId }
  })
  return new URL(href, window.location.origin).href
}

const allDiscussionsRoute = computed(() => ({
  query: { ...route.query, discussion_id: undefined }
}))

// Deeplinked discussion, fetched on its own so it doesn't depend on pagination
watch(
  [selectedDiscussionId, () => props.subject.id],
  async ([discussionId], _, onCleanup) => {
    selectedDiscussion.value = null
    if (!discussionId) return
    // subject is stale while the parent view loads another item: wait for it
    const itemId = route.params.item_id
    if (itemId !== props.subject.id && itemId !== props.subject.slug) return
    let cancelled = false
    onCleanup(() => (cancelled = true))
    const discussion = await fetchDiscussion(discussionId)
    if (cancelled) return
    if (!discussion) {
      console.warn(`Discussion ${discussionId} not found for this subject.`)
      router.replace(allDiscussionsRoute.value)
      return
    }
    selectedDiscussion.value = discussion
    nextTick(() =>
      header.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    )
  },
  { immediate: true }
)

const changePage = (page: number) => {
  currentPage.value = page
  header.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

defineExpose({ total })
</script>

<template>
  <div ref="header" class="fr-grid-row fr-grid-row--middle discussion-header">
    <div class="fr-col">
      <div v-if="selectedDiscussionId" class="fr-mt-4w fr-mb-2w">
        <RouterLink
          :to="allDiscussionsRoute"
          class="fr-link fr-icon-arrow-left-line fr-link--icon-left"
        >
          Voir toutes les discussions
        </RouterLink>
      </div>
      <h2 v-else-if="discussions" class="discussions-count-title fr-mt-4w">
        {{ discussionsCountLabel }}
      </h2>
      <h2 v-else class="discussions-count-title fr-mt-4w">Discussions</h2>
    </div>
    <template v-if="allowDiscussionCreation && !selectedDiscussionId">
      <DsfrButton
        v-if="loggedIn"
        size="sm"
        secondary
        type="button"
        icon="fr-icon-add-line"
        label="Démarrer une nouvelle discussion"
        @click="openNewDiscussionForm()"
      />
      <DsfrButton
        v-else
        size="sm"
        secondary
        type="button"
        icon="fr-icon-account-line"
        label="Connectez-vous pour démarrer une discussion"
        @click="triggerLogin()"
      />
    </template>
  </div>

  <DiscussionMessageForm
    v-if="isFormOpen('newDiscussion')"
    v-model:title="formData.title"
    v-model:comment="formData.comment"
    v-model:organization="formData.organization"
    id-prefix="discussion"
    submit-label="Envoyer"
    with-title
    with-identity
    class="fr-mb-4w"
    @submit="submitDiscussion()"
    @cancel="closeForm()"
  />

  <BlankState
    v-if="!selectedDiscussionId && !shownDiscussions.length"
    image="/static/blank_state/discussion.svg"
    :message="emptyMessage"
  />
  <div v-else>
    <div
      v-for="discussion in shownDiscussions"
      :key="discussion.id"
      class="discussion-item fr-mb-3w"
    >
      <div
        class="fr-grid-row fr-grid-row--middle discussion-title-row fr-mb-1v"
      >
        <div class="discussion-title-group fr-col">
          <div :id="`discussion-${discussion.id}`" class="discussion-title">
            <span
              v-if="discussion.closed"
              class="fr-icon-lock-line fr-icon--sm"
              aria-hidden="true"
            ></span>
            {{ discussion.title }}
          </div>
          <CopyButton
            label="Copier le lien vers cette discussion"
            copied-label="Lien copié"
            :text="discussionPermalink(discussion.id)"
          />
        </div>
        <DiscussionItemActions
          :permissions="discussion.permissions"
          item-label="la discussion"
          @edit="openEditDiscussionForm(discussion)"
          @delete="confirmDeleteDiscussion(discussion)"
        />
      </div>

      <DiscussionCommentMeta
        class="fr-mb-3v"
        :comment="discussion.discussion[0]"
        :is-producer="isProducer(discussion.discussion[0])"
      />

      <div
        v-if="discussion.closed"
        class="discussion-subtitle closed-banner fr-mb-3v"
      >
        <span v-if="discussion.closed_by || discussion.closed_by_organization"
          >Discussion close par</span
        >
        <span v-else>Discussion close</span>
        <DiscussionAuthor
          v-if="discussion.closed_by || discussion.closed_by_organization"
          :owner="discussion.closed_by"
          :organization="discussion.closed_by_organization"
        />
        <time :datetime="discussion.closed" class="comment-date">
          le {{ formatDate(discussion.closed, 'medium') }}
        </time>
      </div>

      <template
        v-if="!discussion.closed || expandedDiscussions.has(discussion.id)"
      >
        <DiscussionMessageForm
          v-if="isFormOpen('editDiscussion', discussion.id)"
          v-model:title="formData.title"
          v-model:comment="formData.comment"
          :id-prefix="`edit-discussion-${discussion.id}`"
          submit-label="Mettre à jour"
          with-title
          class="fr-mb-4w"
          @submit="submitEditDiscussion(discussion)"
          @cancel="closeForm()"
        />
        <div v-else class="comment-text">
          {{ discussion.discussion[0].content }}
        </div>
        <template v-if="discussion.discussion.length > 1">
          <div class="discussion-answers">
            <div
              v-for="comment in discussion.discussion.slice(1)"
              :key="comment.id"
              class="discussion-answer fr-mt-3v"
              :class="{ 'discussion-answer--producer': isProducer(comment) }"
            >
              <div class="fr-grid-row fr-grid-row--middle">
                <DiscussionCommentMeta
                  class="fr-col"
                  :comment="comment"
                  :is-producer="isProducer(comment)"
                />
                <DiscussionItemActions
                  :permissions="comment.permissions"
                  item-label="le commentaire"
                  @edit="openEditCommentForm(discussion.id, comment)"
                  @delete="confirmDeleteComment(discussion.id, comment.id)"
                />
              </div>
              <DiscussionMessageForm
                v-if="isFormOpen('editComment', comment.id)"
                v-model:comment="formData.comment"
                :id-prefix="`edit-comment-${comment.id}`"
                submit-label="Mettre à jour"
                @submit="submitEditComment()"
                @cancel="closeForm()"
              />
              <div v-else class="comment-text fr-mt-2v">
                {{ comment.content }}
              </div>
            </div>
          </div>
        </template>
      </template>

      <div v-if="discussion.closed" class="discussion-footer fr-mt-3v">
        <DsfrButton
          size="sm"
          secondary
          type="button"
          :label="
            expandedDiscussions.has(discussion.id)
              ? 'Cacher la discussion'
              : 'Voir la discussion'
          "
          @click="toggleDiscussionExpansion(discussion.id)"
        />
      </div>
      <template v-else-if="allowDiscussionCreation">
        <DiscussionMessageForm
          v-if="isFormOpen('reply', discussion.id)"
          v-model:comment="formData.comment"
          v-model:organization="formData.organization"
          :id-prefix="`reply-${discussion.id}`"
          submit-label="Répondre"
          with-identity
          class="fr-mt-3w"
          @submit="submitComment(discussion.id)"
          @cancel="closeForm()"
        >
          <template #actions>
            <DsfrButton
              v-if="discussion.permissions.close"
              size="sm"
              secondary
              type="button"
              icon="fr-icon-lock-line"
              label="Répondre et clôturer"
              class="fr-mr-1w"
              @click="submitComment(discussion.id, true)"
            />
          </template>
        </DiscussionMessageForm>
        <div v-else class="discussion-footer fr-mt-3v">
          <DsfrButton
            v-if="loggedIn"
            size="sm"
            secondary
            type="button"
            label="Répondre"
            :aria-describedby="`discussion-${discussion.id}`"
            @click="openReplyForm(discussion.id)"
          />
          <DsfrButton
            v-else
            size="sm"
            secondary
            type="button"
            icon="fr-icon-account-line"
            label="Connectez-vous pour répondre"
            @click="triggerLogin()"
          />
        </div>
      </template>
    </div>
    <div v-if="!selectedDiscussionId && pages?.length > 1" class="fr-container">
      <DsfrPagination
        :trunc-limit="3"
        :current-page="currentPage - 1"
        :pages="pages"
        @update:current-page="(p: number) => changePage(p + 1)"
      />
    </div>
  </div>
</template>

<style scoped>
.discussion-header {
  justify-content: space-between;
}
.discussions-count-title {
  font-size: 0.875rem;
  font-weight: bold;
  text-transform: uppercase;
  color: var(--text-title-grey);
}
.discussion-item {
  border: 1px solid var(--border-default-grey);
  border-radius: 0.25rem;
  padding: 1rem;
}
.discussion-title-row {
  justify-content: space-between;
}
.discussion-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.discussion-footer {
  display: flex;
  justify-content: flex-end;
}
.start-discussion {
  flex: 1 1 auto;
}
.discussion-title {
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
  color: var(--text-title-grey);
}

.discussion-subtitle {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  column-gap: 0.5rem;
  row-gap: 0.25rem;
}

.comment-date,
.separator {
  color: #666;
  font-size: 0.75rem;
}

.closed-banner {
  font-size: 0.75rem;
  color: var(--text-mention-grey);
}

.discussion-answer {
  border-left: 2px solid var(--grey-900-175);
  padding-left: 10px;
}
.discussion-answer--producer {
  border-left-color: var(--text-action-high-blue-france);
}

.comment-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.25rem;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
