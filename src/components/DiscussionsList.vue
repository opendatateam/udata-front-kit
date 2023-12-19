<script setup lang="ts">
import type { Ref } from 'vue'
import { defineProps, ref, watchEffect } from 'vue'

import config from '../config'
import type { DiscussionResponse } from '../model/discussion'
import { useDiscussionStore } from '../store/DiscussionStore'
import { formatDate, fromMarkdown } from '../utils'

const discussionStore = useDiscussionStore()

const discussions: Ref<DiscussionResponse | null> = ref(null)
const currentPage: Ref<number> = ref(1)
const pages: Ref<object[]> = ref([])
const blankDiscussion = '/blank_state/discussion.svg'

type SubjectType = 'dataset' | 'topic'

const props = defineProps({
  subject: {
    type: Object,
    required: true
  },
  subjectType: {
    type: String as () => SubjectType,
    default: 'dataset'
  }
})

const getUserAvatar = (post) => {
  if (post.posted_by.avatar_thumbnail) {
    return post.posted_by.avatar_thumbnail
  }
  return `${config.datagouvfr.base_url}/api/1/avatars/${post.posted_by.id}/20`
}

watchEffect(() => {
  const subjectId = props.subject.id
  if (!subjectId) return
  discussionStore
    .loadDiscussionsForSubject(subjectId, currentPage.value)
    .then((d) => {
      discussions.value = d
      if (!pages.value.length) {
        pages.value =
          discussionStore.getDiscussionsPaginationForSubject(subjectId)
      }
    })
})
</script>

<template>
  <div
    v-if="!discussions?.data?.length"
    class="fr-grid-row flex-direction-column fr-grid-row--middle fr-mt-5w"
  >
    <img
      class="fr-responsive-img"
      :src="blankDiscussion"
      style="height: 105px; width: 130px"
    />
    <p class="fr-h6 fr-mt-2w fr-mb-5v text-center">
      Pas de discussion pour ce jeu de données.
    </p>
  </div>
  <div v-else>
    <h2 class="fr-mt-4w">Discussions</h2>
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
      <!-- eslint-disable vue/no-v-html -->
      <div
        class="comment"
        v-html="fromMarkdown(discussion.discussion[0].content)"
      ></div>
      <template v-if="discussion.discussion.length > 1">
        <div
          v-for="comment in discussion.discussion.slice(1)"
          :key="comment.content"
          class="fr-mt-md-3v fr-pl-3v"
        >
          <div
            class="secondary-comment-content"
            v-html="fromMarkdown(comment.content)"
          ></div>
          <div class="discussion-subtitle">
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
      <!-- eslint-enable vue/no-v-html -->
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
</style>
