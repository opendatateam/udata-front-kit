<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { ComputedRef, Ref } from 'vue'
import { ref, watchEffect, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import config from '@/config'
import type {
  DiscussionResponse,
  DiscussionForm,
  SubjectClass
} from '@/model/discussion'
import { SubjectClassLabels } from '@/model/discussion'
import LocalStorageService from '@/services/LocalStorageService'
import { useDiscussionStore } from '@/store/DiscussionStore'
import { useUserStore } from '@/store/UserStore'

import DiscussionDetails from './DiscussionDetails.vue'

const route = useRoute()
const router = useRouter()

const discussionStore = useDiscussionStore()
const userStore = useUserStore()

const { loggedIn } = storeToRefs(userStore)
const currentPage: Ref<number> = ref(1)
const showDiscussionForm: Ref<boolean> = ref(false)

const props = defineProps({
  subject: {
    type: Object,
    required: true
  },
  subjectClass: {
    type: String as () => SubjectClass,
    default: 'Dataset'
  },
  externalUrl: {
    type: String,
    default: undefined
  },
  modelName: {
    type: String,
    default: undefined
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

const triggerLogin = () => {
  LocalStorageService.setItem('lastRoute', route)
  router.push({ name: 'login' })
}

const createDiscussion = () => {
  if (props.externalUrl !== undefined && props.modelName !== undefined) {
    discussionForm.value.extras = {
      ...discussionForm.value.extras,
      notification: {
        external_url: props.externalUrl,
        model_name: props.modelName
      }
    }
  }
  discussionStore.createDiscussion(discussionForm.value).then((d) => {
    if (d !== undefined) {
      discussionForm.value.title = ''
      discussionForm.value.comment = ''
      showDiscussionForm.value = false
      currentPage.value = 1
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
      Pas de discussion pour ce {{ SubjectClassLabels[props.subjectClass] }}.
    </p>
  </div>
  <div v-else>
    <div
      v-for="discussion in discussions?.data"
      :key="discussion.id"
      class="fr-mb-6w"
    >
      <DiscussionDetails
        :discussion="discussion"
        :subject-id="subject.id"
        :allow-discussion-comment="allowDiscussionCreation"
        @trigger-login="triggerLogin"
      />
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
