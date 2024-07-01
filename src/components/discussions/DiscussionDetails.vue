<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, type Ref } from 'vue'

import config from '@/config'
import type {
  Discussion,
  Post,
  PostForm,
  DiscussionId
} from '@/model/discussion'
import { useDiscussionStore } from '@/store/DiscussionStore'
import { useUserStore } from '@/store/UserStore'
import { formatDate } from '@/utils'

const props = defineProps({
  discussion: {
    type: Object as () => Discussion,
    required: true
  },
  subjectId: {
    type: String,
    required: true
  },
  allowDiscussionComment: {
    type: Boolean
  }
})

const emits = defineEmits(['triggerLogin'])

const discussionStore = useDiscussionStore()
const userStore = useUserStore()
const { loggedIn } = storeToRefs(userStore)

const postFormId: Ref<DiscussionId | null> = ref(null)
const postForm: Ref<PostForm> = ref({ comment: '' })

const getUserAvatar = (post: Post) => {
  if (post.posted_by.avatar_thumbnail) {
    return post.posted_by.avatar_thumbnail
  }
  return `${config.datagouvfr.base_url}/api/1/avatars/${post.posted_by.id}/20`
}

const createPost = (discussionId: DiscussionId) => {
  discussionStore
    .createPost(props.subjectId, discussionId, postForm.value)
    .then((d) => {
      if (d !== undefined) {
        postForm.value.comment = ''
        postFormId.value = null
      }
    })
}
</script>

<template>
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
  <div v-if="allowDiscussionComment">
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
      @click.stop.prevent="emits('triggerLogin')"
    >
      Connectez-vous pour répondre
    </button>
    <form
      v-if="postFormId === discussion.id"
      @submit.stop.prevent="createPost(discussion.id)"
    >
      <div class="fr-input-group">
        <label class="fr-label" for="discussion-message"> Commentaire * </label>
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
