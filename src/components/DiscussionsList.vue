<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { ComputedRef, Ref } from 'vue'
import { ref, watchEffect, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import config from '@/config'
import type {
  DiscussionResponse,
  DiscussionForm,
  SubjectClass,
  PostForm,
  DiscussionId,
  Post
} from '@/model/discussion'
import LocalStorageService from '@/services/LocalStorageService'
import { useDiscussionStore } from '@/store/DiscussionStore'
import { useUserStore } from '@/store/UserStore'
import { formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()

const discussionStore = useDiscussionStore()
const userStore = useUserStore()

const topicName = config.website.topics.topicName.name

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
  }
})

const subjectClassLabels = {
  Dataset: 'jeu de données',
  Topic: topicName
}

const discussionForm: Ref<DiscussionForm> = ref({
  title: '',
  comment: '',
  subject: {
    id: props.subject.id,
    class: props.subjectClass
  }
})

const postForm: Ref<PostForm> = ref({ comment: '' })

const discussions: ComputedRef<DiscussionResponse | undefined> = computed(
  () => {
    return discussionStore.getDiscussionsForSubject(
      props.subject.id,
      currentPage.value
    )
  }
)
const pages: ComputedRef<object[]> = computed(() => {
  return discussionStore.getDiscussionsPaginationForSubject(props.subject.id)
})

const allowDiscussionCreation = computed(() => {
  return config.website.discussions[props.subjectClass.toLowerCase()].create
})

const getUserAvatar = (post: Post) => {
  if (post.posted_by.avatar_thumbnail) {
    return post.posted_by.avatar_thumbnail
  }
  return `${config.datagouvfr.base_url}/api/1/avatars/${post.posted_by.id}/20`
}

const triggerLogin = () => {
  LocalStorageService.setItem('lastRoute', route)
  router.push({ name: 'login' })
}

const createDiscussion = () => {
  discussionStore.createDiscussion(discussionForm.value).then((d) => {
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

watchEffect(() => {
  if (!props.subject.id) return
  discussionStore.loadDiscussionsForSubject(props.subject.id, currentPage.value)
  discussionForm.value.subject = {
    id: props.subject.id,
    class: props.subjectClass
  }
})
</script>

<template>
  <div class="fr-grid-row fr-grid-row--middle">
    <div class="fr-col">
      <h2 class="fr-mt-4w">Discussions</h2>
    </div>
    <div v-if="allowDiscussionCreation" class="fr-col text-align-right">
      <button
        v-if="loggedIn"
        type="button"
        class="fr-btn fr-btn--sm fr-btn--secondary fr-btn--secondary-grey-500 fr-icon-add-line fr-btn--icon-left"
        @click.stop.prevent="showDiscussionForm = true"
      >
        Démarrer une nouvelle discussion
      </button>
      <button
        v-else
        type="button"
        class="fr-btn fr-btn--sm fr-btn--secondary fr-btn--secondary-grey-500 fr-icon-account-line fr-btn--icon-left"
        @click.stop.prevent="triggerLogin()"
      >
        Connectez-vous pour démarrer une discussion
      </button>
    </div>
  </div>

  <div v-if="showDiscussionForm" class="fr-mb-4w">
    <form @submit.stop.prevent="createDiscussion()">
      <div class="fr-input-group">
        <label class="fr-label" for="discussion-title"> Titre * </label>
        <input
          id="discussion-title"
          v-model="discussionForm.title"
          required
          class="fr-input"
          name="title"
        />
      </div>
      <div class="fr-input-group">
        <label class="fr-label" for="discussion-message"> Message * </label>
        <textarea
          id="discussion-message"
          v-model="discussionForm.comment"
          required
          class="fr-input"
          name="message"
        ></textarea>
      </div>
      <div class="text-align-right">
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

  <div
    v-if="!discussions?.data?.length"
    class="fr-grid-row flex-direction-column fr-grid-row--middle fr-mt-5w"
  >
    <img
      height="105"
      width="130"
      loading="lazy"
      src="/blank_state/discussion.svg"
    />
    <p class="fr-h6 fr-mt-2w fr-mb-5v text-center">
      Pas de discussion pour ce {{ subjectClassLabels[props.subjectClass] }}.
    </p>
  </div>
  <div v-else>
    <div
      v-for="discussion in discussions?.data"
      :key="discussion.id"
      class="fr-mb-6w"
    >
      <div class="discussion-title">{{ discussion.title }}</div>
      <div class="discussion-subtitle">
        <div class="avatar fr-mr-1v">
          <img
            style="border-radius: 50%"
            :src="getUserAvatar(discussion.discussion[0])"
            width="20"
          />
        </div>
        <div class="user-name fr-mb-md-1v">
          {{ discussion.discussion[0].posted_by.first_name }}
          {{ discussion.discussion[0].posted_by.last_name }}
        </div>
        <div class="date-comment">
          - le {{ formatDate(discussion.discussion[0].posted_on) }}
        </div>
      </div>
      <div class="comment comment-text">
        {{ discussion.discussion[0].content }}
      </div>
      <template v-if="discussion.discussion.length > 1">
        <div
          v-for="comment in discussion.discussion.slice(1)"
          :key="comment.content"
          class="fr-mt-md-3v fr-pl-3v"
        >
          <div class="secondary-comment-content comment-text">
            {{ comment.content }}
          </div>
          <div class="discussion-subtitle fr-mb-2w">
            <div class="avatar fr-mr-1v">
              <img
                style="border-radius: 50%"
                :src="getUserAvatar(comment)"
                width="20"
              />
            </div>
            <div class="user-name fr-mb-md-1v">
              {{ comment.posted_by.first_name }}
              {{ comment.posted_by.last_name }}
            </div>
            <div class="comment">- le {{ formatDate(comment.posted_on) }}</div>
          </div>
        </div>
      </template>
      <div v-if="allowDiscussionCreation">
        <button
          v-if="postFormId !== discussion.id && loggedIn"
          type="button"
          class="fr-btn fr-btn--sm fr-btn--secondary fr-btn--secondary-grey-500 fr-icon-chat-3-line fr-btn--icon-left"
          @click.stop.prevent="
            () => {
              postForm.comment = ''
              postFormId = discussion.id
            }
          "
        >
          Répondre
        </button>
        <button
          v-if="!loggedIn"
          type="button"
          class="fr-btn fr-btn--sm fr-btn--secondary fr-btn--secondary-grey-500 fr-icon-account-line fr-btn--icon-left"
          @click.stop.prevent="triggerLogin()"
        >
          Connectez-vous pour répondre
        </button>
        <form
          v-if="postFormId === discussion.id"
          @submit.stop.prevent="createPost(discussion.id)"
        >
          <div class="fr-input-group">
            <label class="fr-label" for="discussion-message">
              Commentaire *
            </label>
            <textarea
              id="discussion-message"
              v-model="postForm.comment"
              required
              class="fr-input"
              name="message"
            ></textarea>
          </div>
          <div class="text-align-right">
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
        :current-page="currentPage - 1"
        :pages="pages"
        @update:current-page="(p: number) => (currentPage = p + 1)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.discussion-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.discussion-subtitle {
  display: flex;
}

.user-name {
  color: #3557a2;
  font-size: 14px;
}

.avatar {
  display: flex;
  align-items: center;
}

.comment-date {
  color: #777777;
  font-style: italic;
  font-size: 14px;
}

.comment {
  font-size: 14px;
}

.secondary-comment-content {
  font-size: 14px;
  border-left: 2px solid #dddddd;
  padding-left: 10px;
  margin-bottom: 10px;
}

.comment-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
