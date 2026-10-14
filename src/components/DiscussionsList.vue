<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { ComputedRef, Ref } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BlankState from '@/components/BlankState.vue'
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

const props = defineProps({
  subject: {
    type: Object,
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
  index: number
}

const editPostInfo: Ref<EditPostInfo | null> = ref(null)
const editPostForm: Ref<PostForm> = ref({ comment: '' })

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

const allowDiscussionCreation = pageConf.resources_tabs.discussions.create

// If configured, construct an external notification url from canonical_url for udata to use
const getNotificationExternalUrl = (): string | null => {
  if (!pageConf.resources_tabs.discussions.notify_url_override) return null
  const canonicalUrl = config.website.seo?.canonical_url
  if (!canonicalUrl) return null
  const slug = (props.subject as { slug?: string }).slug
  if (!slug) return null
  const path = router.resolve({
    name: `${pageKey}_detail`,
    params: { item_id: slug }
  }).href
  return `${canonicalUrl}${path}`
}

const getUserAvatar = (post: Comment) => {
  if (post.posted_by.avatar_thumbnail) {
    return post.posted_by.avatar_thumbnail
  }
  return `${config.datagouvfr.base_url}/api/1/avatars/${post.posted_by.id}/20`
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

const createPost = (discussionId: DiscussionId) => {
  discussionStore
    .createPost(props.subject.id, discussionId, postForm.value)
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
      0,
      editDiscussionForm.value.comment
    )
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

const startEditPost = (
  discussionId: DiscussionId,
  index: number,
  post: Comment
) => {
  postFormId.value = null
  editDiscussionId.value = null
  editPostForm.value = { comment: post.content }
  editPostInfo.value = { discussionId, index }
}

const cancelEditPost = () => {
  editPostInfo.value = null
}

const submitEditPost = async () => {
  if (editPostInfo.value === null) return
  await discussionStore.updateComment(
    props.subject.id,
    editPostInfo.value.discussionId,
    editPostInfo.value.index,
    editPostForm.value.comment
  )
  editPostInfo.value = null
}

const deleteComment = (discussionId: DiscussionId, index: number) => {
  if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?'))
    return
  // Deleting shifts every later index, so a stale open edit form on this
  // discussion could end up pointing at the wrong comment.
  if (editPostInfo.value?.discussionId === discussionId) {
    editPostInfo.value = null
  }
  discussionStore.deleteComment(props.subject.id, discussionId, index)
}

watch(
  [() => props.subject.id, () => currentPage.value, () => props.subjectClass],
  ([subjectId, page, subjectClass]) => {
    if (!subjectId) return
    discussionStore.loadDiscussionsForSubject(subjectId, page)
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
      <h2 class="fr-mt-4w">Discussions</h2>
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
          class="fr-btn fr-btn--secondary fr-mr-1w"
          @click.stop.prevent="showDiscussionForm = false"
        >
          Annuler
        </button>
        <button type="submit" class="fr-btn">Soumettre</button>
      </div>
    </form>
  </div>

  <BlankState
    v-if="!discussions?.data?.length"
    image="/static/blank_state/discussion.svg"
    :message="emptyMessage"
  />
  <div v-else class="fr-mt-4w">
    <div
      v-for="discussion in discussions?.data"
      :key="discussion.id"
      class="fr-mb-6w"
    >
      <div class="fr-grid-row fr-grid-row--middle discussion-title-row">
        <p
          :id="`discussion-${discussion.id}`"
          class="discussion-title fr-col fr-mb-3v"
        >
          {{ discussion.title }}
        </p>
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
            class="fr-btn fr-btn--secondary fr-mr-1w"
            @click.stop.prevent="cancelEditDiscussion()"
          >
            Annuler
          </button>
          <button type="submit" class="fr-btn">Mettre à jour</button>
        </div>
      </form>
      <template v-else>
        <div class="discussion-subtitle">
          <div class="avatar">
            <img
              :src="getUserAvatar(discussion.discussion[0])"
              alt=""
              loading="lazy"
              width="20"
              height="20"
            />
          </div>
          <p class="user-name">
            {{ discussion.discussion[0].posted_by.first_name }}
            {{ discussion.discussion[0].posted_by.last_name }}
          </p>
          <time
            :datetime="discussion.discussion[0].posted_on"
            class="comment-date"
          >
            - le {{ formatDate(discussion.discussion[0].posted_on) }}
          </time>
        </div>
        <p class="comment comment-text fr-mt-2v">
          {{ discussion.discussion[0].content }}
        </p>
      </template>
      <template v-if="discussion.discussion.length > 1">
        <div class="discussion-answers">
          <div
            v-for="(comment, commentIndex) in discussion.discussion.slice(1)"
            :key="comment.id"
            class="discussion-answer fr-mt-3w"
          >
            <div class="fr-grid-row fr-grid-row--middle">
              <div class="discussion-subtitle fr-col">
                <div class="avatar">
                  <img
                    :src="getUserAvatar(comment)"
                    alt=""
                    loading="lazy"
                    width="20"
                    height="20"
                  />
                </div>
                <p class="user-name">
                  {{ comment.posted_by.first_name }}
                  {{ comment.posted_by.last_name }}
                </p>
                <time :datetime="comment.posted_on" class="comment-date">
                  - le {{ formatDate(comment.posted_on) }}
                </time>
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
                  @click.stop.prevent="
                    startEditPost(discussion.id, commentIndex + 1, comment)
                  "
                ></button>
                <button
                  v-if="comment.permissions.delete"
                  type="button"
                  class="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-delete-line"
                  title="Supprimer le commentaire"
                  aria-label="Supprimer le commentaire"
                  @click.stop.prevent="
                    deleteComment(discussion.id, commentIndex + 1)
                  "
                ></button>
              </div>
            </div>
            <form
              v-if="
                editPostInfo?.discussionId === discussion.id &&
                editPostInfo.index === commentIndex + 1
              "
              @submit.stop.prevent="submitEditPost()"
            >
              <div class="fr-input-group">
                <label
                  class="fr-label"
                  :for="`edit-comment-${discussion.id}-${commentIndex + 1}`"
                >
                  Commentaire (obligatoire)
                </label>
                <textarea
                  :id="`edit-comment-${discussion.id}-${commentIndex + 1}`"
                  v-model="editPostForm.comment"
                  required
                  class="fr-input"
                  name="message"
                ></textarea>
              </div>
              <div class="align-right">
                <button
                  type="button"
                  class="fr-btn fr-btn--secondary fr-mr-1w"
                  @click.stop.prevent="cancelEditPost()"
                >
                  Annuler
                </button>
                <button type="submit" class="fr-btn">Mettre à jour</button>
              </div>
            </form>
            <p
              v-else
              class="secondary-comment-content comment-text fr-ml-md-7v fr-mt-2v"
            >
              {{ comment.content }}
            </p>
          </div>
        </div>
      </template>
      <div v-if="allowDiscussionCreation" class="fr-mt-3w">
        <button
          v-if="postFormId !== discussion.id && loggedIn"
          type="button"
          class="fr-btn fr-btn--sm fr-btn--secondary fr-icon-chat-3-line fr-btn--icon-left"
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
          v-if="!loggedIn"
          type="button"
          class="fr-btn fr-btn--sm fr-btn--secondary fr-icon-account-line fr-btn--icon-left"
          @click.stop.prevent="triggerLogin()"
        >
          Connectez-vous pour répondre
        </button>
        <form
          v-if="postFormId === discussion.id"
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
              class="fr-btn fr-btn--secondary fr-mr-1w"
              @click.stop.prevent="postFormId = null"
            >
              Annuler
            </button>
            <button type="submit" class="fr-btn">Soumettre</button>
          </div>
        </form>
      </div>
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
.discussion-title-row {
  justify-content: space-between;
}
.discussion-item-actions {
  display: flex;
  flex: 0 0 auto;
  column-gap: 0.25rem;
}
.start-discussion {
  flex: 1 1 auto;
}
.discussion-title {
  font-size: 1.125rem;
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

.user-name {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-action-high-blue-france);
}

.avatar {
  display: flex;
  align-items: center;
}
.avatar > img {
  border-radius: 50%;
}

.comment-date {
  color: #666;
  font-style: italic;
  font-size: 0.875rem;
}

.comment {
  font-size: 0.875rem;
}

.secondary-comment-content {
  font-size: 0.875rem;
  border-left: 2px solid var(--grey-900-175);
  padding-left: 10px;
  margin-bottom: 10px;
}

.comment-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
