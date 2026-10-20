<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { PropType, Ref } from 'vue'
import { computed, nextTick, ref, toRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BlankState from '@/components/BlankState.vue'
import DiscussionAuthor from '@/components/DiscussionAuthor.vue'
import DiscussionCommentMeta from '@/components/DiscussionCommentMeta.vue'
import DiscussionIdentitySelect from '@/components/DiscussionIdentitySelect.vue'
import config from '@/config'
import type {
  Comment,
  CommentForm,
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

const route = useRoute()
const router = useRouter()

const userStore = useUserStore()

const { pageKey, pageConf } = useCurrentPageConf()

const { loggedIn } = storeToRefs(userStore)
const showDiscussionForm: Ref<boolean> = ref(false)
const commentFormId: Ref<DiscussionId | null> = ref(null)

interface DiscussionSubject {
  id: string
  slug?: string
  owner?: { id: string } | null
  organization?: { id: string } | null
}

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
  loaded,
  createDiscussion,
  createComment,
  updateDiscussionTitle,
  updateComment,
  deleteDiscussion,
  deleteComment
} = useDiscussions(toRef(() => props.subject.id))

const total = computed(() => discussions.value?.total ?? 0)

const discussionForm: Ref<DiscussionForm> = ref({
  title: '',
  comment: '',
  subject: {
    id: props.subject.id,
    class: props.subjectClass
  }
})

const commentForm: Ref<CommentForm> = ref({ comment: '' })

// null means posting as yourself
const discussionOrganization: Ref<string | null> = ref(null)
const commentOrganization: Ref<string | null> = ref(null)

const editDiscussionId: Ref<DiscussionId | null> = ref(null)
const editDiscussionForm: Ref<{ title: string; comment: string }> = ref({
  title: '',
  comment: ''
})

interface EditCommentInfo {
  discussionId: DiscussionId
  commentId: string
}

const editCommentInfo: Ref<EditCommentInfo | null> = ref(null)
const editCommentForm: Ref<CommentForm> = ref({ comment: '' })

const expandedDiscussions: Ref<Set<DiscussionId>> = ref(new Set())
const toggleDiscussionExpansion = (discussionId: DiscussionId) => {
  if (expandedDiscussions.value.has(discussionId)) {
    expandedDiscussions.value.delete(discussionId)
  } else {
    expandedDiscussions.value.add(discussionId)
  }
}

const discussionsCountLabel = computed(() => {
  const label =
    total.value > 1 ? `${total.value} discussions` : `${total.value} discussion`
  if (!closedCount.value) return label
  const closedLabel = closedCount.value > 1 ? 'clôturées' : 'clôturée'
  return `${label} dont ${closedCount.value} ${closedLabel}`
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
    params: { item_id: slug }
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

const submitDiscussion = () => {
  const externalUrl = getNotificationExternalUrl()
  const payload: DiscussionForm = {
    ...discussionForm.value,
    ...(discussionOrganization.value
      ? { organization: discussionOrganization.value }
      : {}),
    ...(externalUrl
      ? { extras: { notification: { external_url: externalUrl } } }
      : {})
  }
  createDiscussion(payload).then(() => {
    discussionForm.value.title = ''
    discussionForm.value.comment = ''
    discussionOrganization.value = null
    showDiscussionForm.value = false
  })
}

const cancelCreateDiscussion = () => {
  showDiscussionForm.value = false
  discussionOrganization.value = null
}

const submitComment = (discussionId: DiscussionId, close = false) => {
  createComment(discussionId, {
    ...commentForm.value,
    ...(commentOrganization.value
      ? { organization: commentOrganization.value }
      : {}),
    close
  }).then(() => {
    commentForm.value.comment = ''
    commentOrganization.value = null
    commentFormId.value = null
  })
}

const cancelComment = () => {
  commentFormId.value = null
  commentOrganization.value = null
}

const openCommentForm = (discussionId: DiscussionId) => {
  commentForm.value.comment = ''
  commentOrganization.value = null
  commentFormId.value = discussionId
  editDiscussionId.value = null
  editCommentInfo.value = null
}

const startEditDiscussion = (discussion: Discussion) => {
  commentFormId.value = null
  editCommentInfo.value = null
  editDiscussionForm.value = {
    title: discussion.title,
    comment: discussion.discussion[0].content
  }
  editDiscussionId.value = discussion.id
}

const cancelEditDiscussion = () => {
  editDiscussionId.value = null
}

const submitEditDiscussion = async (discussion: Discussion) => {
  const firstComment = discussion.discussion[0]
  try {
    if (editDiscussionForm.value.title !== discussion.title) {
      await updateDiscussionTitle(discussion.id, editDiscussionForm.value.title)
    }
    // Title and first-comment content live on two separate udata endpoints,
    // so changing both takes two requests.
    if (editDiscussionForm.value.comment !== firstComment.content) {
      await updateComment(
        discussion.id,
        firstComment.id,
        editDiscussionForm.value.comment
      )
    }
  } catch {
    // Toasted by the API layer; keep the form open so the user can retry.
    return
  }
  editDiscussionId.value = null
}

const confirmDeleteDiscussion = (discussion: Discussion) => {
  if (
    !window.confirm(
      'Êtes-vous sûr de vouloir supprimer cette discussion et tous ses commentaires ?'
    )
  )
    return
  deleteDiscussion(discussion.id)
}

const startEditComment = (discussionId: DiscussionId, comment: Comment) => {
  commentFormId.value = null
  editDiscussionId.value = null
  editCommentForm.value = { comment: comment.content }
  editCommentInfo.value = { discussionId, commentId: comment.id }
}

const cancelEditComment = () => {
  editCommentInfo.value = null
}

const submitEditComment = async () => {
  if (editCommentInfo.value === null) return
  await updateComment(
    editCommentInfo.value.discussionId,
    editCommentInfo.value.commentId,
    editCommentForm.value.comment
  )
  editCommentInfo.value = null
}

const confirmDeleteComment = (
  discussionId: DiscussionId,
  commentId: string
) => {
  if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?'))
    return
  if (editCommentInfo.value?.commentId === commentId) {
    editCommentInfo.value = null
  }
  deleteComment(discussionId, commentId)
}

watch(
  [() => props.subject.id, () => props.subjectClass],
  ([id, subjectClass]) => {
    discussionForm.value.subject = { id, class: subjectClass }
  }
)

// Used by parent views to deep-link to a discussion
// Only looks at the currently loaded page: discussions on further pages are a known limitation.
const navigateToDiscussion = async (discussionId: DiscussionId) => {
  await loaded()
  nextTick(() => {
    const el = document.getElementById(`discussion-${discussionId}`)
    if (!el) {
      console.warn(`Trying to scroll to discussion ${discussionId}, not found.`)
      return
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

defineExpose({ navigateToDiscussion, total })
</script>

<template>
  <div class="fr-grid-row fr-grid-row--middle discussion-header">
    <div class="fr-col">
      <h2 v-if="discussions" class="discussions-count-title fr-mt-4w">
        {{ discussionsCountLabel }}
      </h2>
      <h2 v-else class="discussions-count-title fr-mt-4w">Discussions</h2>
    </div>
    <template v-if="allowDiscussionCreation">
      <DsfrButton
        v-if="loggedIn"
        size="sm"
        secondary
        type="button"
        icon="fr-icon-add-line"
        label="Démarrer une nouvelle discussion"
        @click="showDiscussionForm = true"
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

  <div v-if="showDiscussionForm" class="fr-mb-4w">
    <form @submit.prevent="submitDiscussion()">
      <DiscussionIdentitySelect v-model="discussionOrganization" />
      <div class="fr-input-group">
        <label class="fr-label" for="discussion-title">
          Titre (obligatoire)</label
        >
        <input
          id="discussion-title"
          v-model="discussionForm.title"
          required
          class="fr-input"
          name="title"
        />
      </div>
      <div class="fr-input-group">
        <label class="fr-label" for="discussion-message">
          Votre message (obligatoire)</label
        >
        <textarea
          id="discussion-message"
          v-model="discussionForm.comment"
          required
          class="fr-input"
          name="message"
        ></textarea>
      </div>
      <div class="align-right">
        <DsfrButton
          size="sm"
          tertiary
          type="button"
          label="Annuler"
          class="fr-mr-1w"
          @click="cancelCreateDiscussion()"
        />
        <DsfrButton size="sm" type="submit" label="Envoyer" />
      </div>
    </form>
  </div>

  <BlankState
    v-if="!discussions?.data?.length"
    image="/static/blank_state/discussion.svg"
    :message="emptyMessage"
  />
  <div v-else>
    <div
      v-for="discussion in discussions?.data"
      :key="discussion.id"
      class="discussion-item fr-mb-3w"
    >
      <div
        class="fr-grid-row fr-grid-row--middle discussion-title-row fr-mb-1v"
      >
        <div
          :id="`discussion-${discussion.id}`"
          class="discussion-title fr-col"
        >
          <span
            v-if="discussion.closed"
            class="fr-icon-lock-line fr-icon--sm"
            aria-hidden="true"
          ></span>
          {{ discussion.title }}
        </div>
        <div
          v-if="discussion.permissions.edit || discussion.permissions.delete"
          class="discussion-item-actions"
        >
          <DsfrButton
            v-if="discussion.permissions.edit"
            size="sm"
            tertiary
            icon-only
            type="button"
            icon="fr-icon-edit-line"
            label="Modifier la discussion"
            @click="startEditDiscussion(discussion)"
          />
          <DsfrButton
            v-if="discussion.permissions.delete"
            size="sm"
            tertiary
            icon-only
            type="button"
            icon="fr-icon-delete-line"
            label="Supprimer la discussion"
            @click="confirmDeleteDiscussion(discussion)"
          />
        </div>
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
        <form
          v-if="editDiscussionId === discussion.id"
          class="fr-mb-4w"
          @submit.prevent="submitEditDiscussion(discussion)"
        >
          <div class="fr-input-group">
            <label
              class="fr-label"
              :for="`edit-discussion-title-${discussion.id}`"
            >
              Titre (obligatoire)</label
            >
            <input
              :id="`edit-discussion-title-${discussion.id}`"
              v-model="editDiscussionForm.title"
              required
              class="fr-input"
              name="title"
            />
          </div>
          <div class="fr-input-group">
            <label
              class="fr-label"
              :for="`edit-discussion-comment-${discussion.id}`"
            >
              Votre message (obligatoire)</label
            >
            <textarea
              :id="`edit-discussion-comment-${discussion.id}`"
              v-model="editDiscussionForm.comment"
              required
              class="fr-input"
              name="message"
            ></textarea>
          </div>
          <div class="align-right">
            <DsfrButton
              size="sm"
              tertiary
              type="button"
              label="Annuler"
              class="fr-mr-1w"
              @click="cancelEditDiscussion()"
            />
            <DsfrButton size="sm" type="submit" label="Mettre à jour" />
          </div>
        </form>
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
                <div
                  v-if="comment.permissions.edit || comment.permissions.delete"
                  class="discussion-item-actions"
                >
                  <DsfrButton
                    v-if="comment.permissions.edit"
                    size="sm"
                    tertiary
                    icon-only
                    type="button"
                    icon="fr-icon-edit-line"
                    label="Modifier le commentaire"
                    @click="startEditComment(discussion.id, comment)"
                  />
                  <DsfrButton
                    v-if="comment.permissions.delete"
                    size="sm"
                    tertiary
                    icon-only
                    type="button"
                    icon="fr-icon-delete-line"
                    label="Supprimer le commentaire"
                    @click="confirmDeleteComment(discussion.id, comment.id)"
                  />
                </div>
              </div>
              <form
                v-if="editCommentInfo?.commentId === comment.id"
                @submit.prevent="submitEditComment()"
              >
                <div class="fr-input-group">
                  <label class="fr-label" :for="`edit-comment-${comment.id}`">
                    Votre message (obligatoire)
                  </label>
                  <textarea
                    :id="`edit-comment-${comment.id}`"
                    v-model="editCommentForm.comment"
                    required
                    class="fr-input"
                    name="message"
                  ></textarea>
                </div>
                <div class="align-right">
                  <DsfrButton
                    size="sm"
                    tertiary
                    type="button"
                    label="Annuler"
                    class="fr-mr-1w"
                    @click="cancelEditComment()"
                  />
                  <DsfrButton size="sm" type="submit" label="Mettre à jour" />
                </div>
              </form>
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
        <form
          v-if="commentFormId === discussion.id"
          class="fr-mt-3w"
          @submit.prevent="submitComment(discussion.id)"
        >
          <DiscussionIdentitySelect v-model="commentOrganization" />
          <div class="fr-input-group">
            <label class="fr-label" for="input-discussion-comment">
              Votre message (obligatoire)
            </label>
            <textarea
              id="input-discussion-comment"
              v-model="commentForm.comment"
              required
              class="fr-input"
              name="message"
            ></textarea>
          </div>
          <div class="align-right">
            <DsfrButton
              size="sm"
              tertiary
              type="button"
              label="Annuler"
              class="fr-mr-1w"
              @click="cancelComment()"
            />
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
            <DsfrButton size="sm" type="submit" label="Répondre" />
          </div>
        </form>
        <div v-else class="discussion-footer fr-mt-3v">
          <DsfrButton
            v-if="loggedIn"
            size="sm"
            secondary
            type="button"
            label="Répondre"
            :aria-describedby="`discussion-${discussion.id}`"
            @click="openCommentForm(discussion.id)"
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
    <div v-if="pages?.length > 1" class="fr-container">
      <DsfrPagination
        :trunc-limit="3"
        :current-page="currentPage - 1"
        :pages="pages"
        @update:current-page="(p: number) => (currentPage = p + 1)"
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
.discussion-item-actions {
  display: flex;
  flex: 0 0 auto;
  column-gap: 0.25rem;
}
.discussion-footer {
  display: flex;
  justify-content: flex-end;
}

/* An icon-left button sits on a different text baseline than a plain one, misaligning the row. */
.align-right .fr-btn {
  vertical-align: middle;
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
