<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { ComputedRef, PropType, Ref } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BlankState from '@/components/BlankState.vue'
import DiscussionAuthor from '@/components/DiscussionAuthor.vue'
import config from '@/config'
import type {
  Comment,
  Discussion,
  DiscussionForm,
  DiscussionId,
  DiscussionResponse,
  PostForm,
  SubjectClass
} from '@/model/discussion'
import { useCurrentPageConf } from '@/router/utils'
import LocalStorageService from '@/services/LocalStorageService'
import { useDiscussionStore } from '@/store/DiscussionStore'
import { useUserStore } from '@/store/UserStore'
import { formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()

const discussionStore = useDiscussionStore()
const userStore = useUserStore()

const { pageKey, pageConf } = useCurrentPageConf()

const { loggedIn } = storeToRefs(userStore)
const currentPage: Ref<number> = ref(1)
const showDiscussionForm: Ref<boolean> = ref(false)
const postFormId: Ref<DiscussionId | null> = ref(null)

// What this component actually reads off the subject (a dataset, dataservice,
// topic or indicator): owner/organization for the producer badge, slug for
// the notification URL.
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

const discussionForm: Ref<DiscussionForm> = ref({
  title: '',
  comment: '',
  subject: {
    id: props.subject.id,
    class: props.subjectClass
  }
})

const postForm: Ref<PostForm> = ref({ comment: '' })

const editDiscussionId: Ref<DiscussionId | null> = ref(null)
const editDiscussionForm: Ref<{ title: string; comment: string }> = ref({
  title: '',
  comment: ''
})

interface EditPostInfo {
  discussionId: DiscussionId
  commentId: string
}

const editPostInfo: Ref<EditPostInfo | null> = ref(null)
const editPostForm: Ref<PostForm> = ref({ comment: '' })

const openClosedDiscussions: Ref<Set<DiscussionId>> = ref(new Set())
const toggleClosedDiscussion = (discussionId: DiscussionId) => {
  if (openClosedDiscussions.value.has(discussionId)) {
    openClosedDiscussions.value.delete(discussionId)
  } else {
    openClosedDiscussions.value.add(discussionId)
  }
}

const discussions: ComputedRef<DiscussionResponse | undefined> = computed(
  () => {
    return discussionStore.getDiscussionsForSubject(
      props.subject.id,
      currentPage.value
    )
  }
)
const pages = computed(() => {
  return discussionStore.getDiscussionsPaginationForSubject(props.subject.id)
})

const closedCount = computed(() =>
  discussionStore.getClosedCountForSubject(props.subject.id)
)

const discussionsCountLabel = computed(() => {
  const total = discussions.value?.total ?? 0
  const label = total > 1 ? `${total} discussions` : `${total} discussion`
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

const createDiscussion = () => {
  const externalUrl = getNotificationExternalUrl()
  const payload: DiscussionForm = {
    ...discussionForm.value,
    ...(externalUrl
      ? { extras: { notification: { external_url: externalUrl } } }
      : {})
  }
  discussionStore.createDiscussion(payload).then((d) => {
    if (d !== undefined) {
      discussionForm.value.title = ''
      discussionForm.value.comment = ''
      showDiscussionForm.value = false
      currentPage.value = 1
    }
  })
}

const createPost = (discussionId: DiscussionId, close = false) => {
  discussionStore
    .createPost(props.subject.id, discussionId, {
      ...postForm.value,
      close
    })
    .then((d) => {
      if (d !== undefined) {
        postForm.value.comment = ''
        postFormId.value = null
      }
    })
}

const startEditDiscussion = (discussion: Discussion) => {
  postFormId.value = null
  editPostInfo.value = null
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
  const firstPost = discussion.discussion[0]
  try {
    if (editDiscussionForm.value.title !== discussion.title) {
      await discussionStore.updateDiscussionTitle(
        props.subject.id,
        discussion.id,
        editDiscussionForm.value.title
      )
    }
    if (editDiscussionForm.value.comment !== firstPost.content) {
      await discussionStore.updateComment(
        props.subject.id,
        discussion.id,
        firstPost.id,
        editDiscussionForm.value.comment
      )
    }
  } catch {
    // Toasted by the API layer; keep the form open so the user can retry.
    return
  }
  editDiscussionId.value = null
}

const deleteDiscussion = (discussion: Discussion) => {
  if (
    !window.confirm(
      'Êtes-vous sûr de vouloir supprimer cette discussion et tous ses commentaires ?'
    )
  )
    return
  discussionStore.deleteDiscussion(props.subject.id, discussion.id)
}

const startEditPost = (discussionId: DiscussionId, post: Comment) => {
  postFormId.value = null
  editDiscussionId.value = null
  editPostForm.value = { comment: post.content }
  editPostInfo.value = { discussionId, commentId: post.id }
}

const cancelEditPost = () => {
  editPostInfo.value = null
}

const submitEditPost = async () => {
  if (editPostInfo.value === null) return
  await discussionStore.updateComment(
    props.subject.id,
    editPostInfo.value.discussionId,
    editPostInfo.value.commentId,
    editPostForm.value.comment
  )
  editPostInfo.value = null
}

const deleteComment = (discussionId: DiscussionId, commentId: string) => {
  if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?'))
    return
  if (editPostInfo.value?.commentId === commentId) {
    editPostInfo.value = null
  }
  discussionStore.deleteComment(props.subject.id, discussionId, commentId)
}

watch(
  [() => props.subject.id, () => currentPage.value, () => props.subjectClass],
  ([subjectId, page, subjectClass]) => {
    if (!subjectId) return
    discussionStore.loadDiscussionsForSubject(subjectId, page)
    discussionStore.loadClosedCountForSubject(subjectId)
    discussionForm.value.subject = {
      id: subjectId,
      class: subjectClass
    }
  },
  { immediate: true }
)

// Used by parent views to deep-link to a discussion
// Only looks at the currently loaded page: discussions on further pages are a known limitation.
const navigateToDiscussion = async (discussionId: DiscussionId) => {
  await discussionStore.loadDiscussionsForSubject(
    props.subject.id,
    currentPage.value
  )
  nextTick(() => {
    const el = document.getElementById(`discussion-${discussionId}`)
    if (!el) {
      console.warn(`Trying to scroll to discussion ${discussionId}, not found.`)
      return
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

defineExpose({ navigateToDiscussion })
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
      <button
        v-if="loggedIn"
        type="button"
        class="fr-btn fr-btn--sm fr-btn--secondary fr-icon-add-line fr-btn--icon-left"
        @click.stop.prevent="showDiscussionForm = true"
      >
        Démarrer une nouvelle discussion
      </button>
      <button
        v-else
        type="button"
        class="fr-btn fr-btn--sm fr-btn--secondary fr-icon-account-line fr-btn--icon-left"
        @click.stop.prevent="triggerLogin()"
      >
        Connectez-vous pour démarrer une discussion
      </button>
    </template>
  </div>

  <div v-if="showDiscussionForm" class="fr-mb-4w">
    <form @submit.stop.prevent="createDiscussion()">
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
          Message (obligatoire)</label
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
        <button
          type="button"
          class="fr-btn fr-btn--sm fr-btn--tertiary fr-mr-1w"
          @click.stop.prevent="showDiscussionForm = false"
        >
          Annuler
        </button>
        <button type="submit" class="fr-btn fr-btn--sm">Envoyer</button>
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
          <button
            v-if="discussion.permissions.edit"
            type="button"
            class="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-edit-line"
            title="Modifier la discussion"
            aria-label="Modifier la discussion"
            @click.stop.prevent="startEditDiscussion(discussion)"
          ></button>
          <button
            v-if="discussion.permissions.delete"
            type="button"
            class="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-delete-line"
            title="Supprimer la discussion"
            aria-label="Supprimer la discussion"
            @click.stop.prevent="deleteDiscussion(discussion)"
          ></button>
        </div>
      </div>

      <div class="discussion-subtitle fr-mb-3v">
        <DiscussionAuthor
          :owner="discussion.discussion[0].posted_by"
          :organization="discussion.discussion[0].posted_by_organization"
        />
        <span class="separator">—</span>
        <time
          :datetime="discussion.discussion[0].posted_on"
          class="comment-date"
        >
          Posté le
          {{ formatDate(discussion.discussion[0].posted_on, 'medium') }}
        </time>
        <template v-if="isProducer(discussion.discussion[0])">
          <span class="separator">—</span>
          <DsfrBadge type="info" small no-icon label="Producteur" />
        </template>
      </div>

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
        v-if="!discussion.closed || openClosedDiscussions.has(discussion.id)"
      >
        <form
          v-if="editDiscussionId === discussion.id"
          class="fr-mb-4w"
          @submit.stop.prevent="submitEditDiscussion(discussion)"
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
              Message (obligatoire)</label
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
            <button
              type="button"
              class="fr-btn fr-btn--sm fr-btn--tertiary fr-mr-1w"
              @click.stop.prevent="cancelEditDiscussion()"
            >
              Annuler
            </button>
            <button type="submit" class="fr-btn fr-btn--sm">
              Mettre à jour
            </button>
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
                <div class="discussion-subtitle fr-col">
                  <DiscussionAuthor
                    :owner="comment.posted_by"
                    :organization="comment.posted_by_organization"
                  />
                  <span class="separator">—</span>
                  <time :datetime="comment.posted_on" class="comment-date">
                    Posté le {{ formatDate(comment.posted_on, 'medium') }}
                  </time>
                  <template v-if="isProducer(comment)">
                    <span class="separator">—</span>
                    <DsfrBadge type="info" small no-icon label="Producteur" />
                  </template>
                </div>
                <div
                  v-if="comment.permissions.edit || comment.permissions.delete"
                  class="discussion-item-actions"
                >
                  <button
                    v-if="comment.permissions.edit"
                    type="button"
                    class="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-edit-line"
                    title="Modifier le commentaire"
                    aria-label="Modifier le commentaire"
                    @click.stop.prevent="startEditPost(discussion.id, comment)"
                  ></button>
                  <button
                    v-if="comment.permissions.delete"
                    type="button"
                    class="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-delete-line"
                    title="Supprimer le commentaire"
                    aria-label="Supprimer le commentaire"
                    @click.stop.prevent="
                      deleteComment(discussion.id, comment.id)
                    "
                  ></button>
                </div>
              </div>
              <form
                v-if="editPostInfo?.commentId === comment.id"
                @submit.stop.prevent="submitEditPost()"
              >
                <div class="fr-input-group">
                  <label class="fr-label" :for="`edit-comment-${comment.id}`">
                    Commentaire (obligatoire)
                  </label>
                  <textarea
                    :id="`edit-comment-${comment.id}`"
                    v-model="editPostForm.comment"
                    required
                    class="fr-input"
                    name="message"
                  ></textarea>
                </div>
                <div class="align-right">
                  <button
                    type="button"
                    class="fr-btn fr-btn--sm fr-btn--tertiary fr-mr-1w"
                    @click.stop.prevent="cancelEditPost()"
                  >
                    Annuler
                  </button>
                  <button type="submit" class="fr-btn fr-btn--sm">
                    Mettre à jour
                  </button>
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
        <button
          type="button"
          class="fr-btn fr-btn--sm fr-btn--secondary"
          @click.stop.prevent="toggleClosedDiscussion(discussion.id)"
        >
          {{
            openClosedDiscussions.has(discussion.id)
              ? 'Cacher la discussion'
              : 'Voir la discussion'
          }}
        </button>
      </div>
      <template v-else-if="allowDiscussionCreation">
        <form
          v-if="postFormId === discussion.id"
          class="fr-mt-3w"
          @submit.stop.prevent="createPost(discussion.id)"
        >
          <div class="fr-input-group">
            <label class="fr-label" for="input-discussion-comment">
              Commentaire (obligatoire)
            </label>
            <textarea
              id="input-discussion-comment"
              v-model="postForm.comment"
              required
              class="fr-input"
              name="message"
            ></textarea>
          </div>
          <div class="align-right">
            <button
              type="button"
              class="fr-btn fr-btn--sm fr-btn--tertiary fr-mr-1w"
              @click.stop.prevent="postFormId = null"
            >
              Annuler
            </button>
            <button
              v-if="discussion.permissions.close"
              type="button"
              class="fr-btn fr-btn--sm fr-btn--secondary fr-icon-lock-line fr-btn--icon-left fr-mr-1w"
              @click.stop.prevent="createPost(discussion.id, true)"
            >
              Répondre et clôturer
            </button>
            <button type="submit" class="fr-btn fr-btn--sm">Répondre</button>
          </div>
        </form>
        <div v-else class="discussion-footer fr-mt-3v">
          <button
            v-if="loggedIn"
            type="button"
            class="fr-btn fr-btn--sm fr-btn--secondary"
            aria-label="Répondre à la discussion"
            :aria-describedby="`discussion-${discussion.id}`"
            @click.stop.prevent="
              () => {
                postForm.comment = ''
                postFormId = discussion.id
                editDiscussionId = null
                editPostInfo = null
              }
            "
          >
            Répondre
          </button>
          <button
            v-else
            type="button"
            class="fr-btn fr-btn--sm fr-btn--secondary fr-icon-account-line fr-btn--icon-left"
            @click.stop.prevent="triggerLogin()"
          >
            Connectez-vous pour répondre
          </button>
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
