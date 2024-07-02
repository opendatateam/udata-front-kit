<script setup lang="ts">
import { onMounted, ref, computed, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import config from '@/config'
import type { Discussion, SubjectClass } from '@/model/discussion'
import { useDiscussionStore } from '@/store/DiscussionStore'

import DiscussionDetails from './DiscussionDetails.vue'

const props = defineProps({
  subject: {
    type: Object,
    required: true
  },
  discussionId: {
    type: String,
    required: true
  },
  subjectClass: {
    type: String as () => SubjectClass,
    default: 'Dataset'
  }
})

const store = useDiscussionStore()
const router = useRouter()
const route = useRoute()

const discussion: Ref<Discussion | undefined> = ref()

const allowDiscussionCreation = computed(() => {
  return config.website.discussions[props.subjectClass.toLowerCase()].create
})

const seeAll = () => {
  router.push({ path: route.path, hash: '' })
}

onMounted(() => {
  store.getDiscussion(props.discussionId).then((data) => {
    discussion.value = data
  })
})
</script>

<template>
  <DsfrNotice
    class="fr-mb-9v"
    type="info"
    title="Vous consultez une discussion spécifique sur ce jeu de données."
    :closeable="true"
    @close="seeAll"
  />
  <DiscussionDetails
    v-if="discussion"
    :discussion="discussion"
    :subject-id="subject.id"
    :allow-discussion-comment="allowDiscussionCreation"
  />
  <button
    class="nav-link nav-link--no-icon text-decoration-none fr-link fr-mt-9v fr-link--icon-left fr-icon-arrow-right-s-line"
    @click.stop.prevent="seeAll"
  >
    <span class="text-decoration-underline"
      >Voir toutes les discussions sur ce jeu de données</span
    >
  </button>
</template>
