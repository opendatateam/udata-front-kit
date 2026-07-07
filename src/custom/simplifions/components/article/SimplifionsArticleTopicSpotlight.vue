<template>
  <div
    class="spotlight"
    :class="isMulti ? 'spotlight--multi' : 'spotlight--single'"
  >
    <div class="spotlight__comment">
      <slot />
    </div>
    <div class="spotlight__cards">
      <template v-if="loading">
        <div v-for="slug in slugs" :key="slug" class="spotlight__skeleton" />
      </template>
      <template v-else>
        <SimplifionsSolutionCard
          v-for="topic in solutionTopics"
          :key="topic.slug"
          :topic="topic"
          :page-key="pageKey"
          :show-description="showDescription"
          :show-image="showImage"
          :show-operateur-tag="showOperateurTag"
          :show-target-users="showTargetUsers"
          :show-fournisseurs="showFournisseurs"
          :show-simplification-tags="showSimplificationTags"
          :show-categorie-de-solution="showCategorieDeSolution"
          :show-arrow="showArrow"
        />
        <SimplifionsCasDusageCard
          v-for="topic in casDusageTopics"
          :key="topic.slug"
          :topic="topic"
          :page-key="pageKey"
          :show-description="showDescription"
          :show-target-users="showTargetUsers"
          :show-fournisseurs="showFournisseurs"
          :show-simplification-tags="showSimplificationTags"
          :show-categorie-de-solution="showCategorieDeSolution"
          :show-arrow="showArrow"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'
import type { TopicCasUsage, TopicSolution } from '../../model/topics'
import SimplifionsCasDusageCard from '../SimplifionsCasDusageCard.vue'
import SimplifionsSolutionCard from '../SimplifionsSolutionCard.vue'

const props = withDefaults(
  defineProps<{
    slugs: string[]
    pageKey: 'solutions' | 'cas-d-usages'
    showDescription?: boolean
    showImage?: boolean
    showOperateurTag?: boolean
    showTargetUsers?: boolean
    showFournisseurs?: boolean
    showSimplificationTags?: boolean
    showCategorieDeSolution?: boolean
    showArrow?: boolean
  }>(),
  {
    showDescription: false,
    showImage: false,
    showOperateurTag: true,
    showTargetUsers: false,
    showFournisseurs: false,
    showSimplificationTags: false,
    showCategorieDeSolution: false,
    showArrow: false
  }
)

const topicStore = useTopicStore()
const loading = ref(true)
const topics = ref<Topic[]>([])

const isMulti = computed(() => props.slugs.length >= 2)

const solutionTopics = computed(() =>
  props.pageKey === 'solutions'
    ? (topics.value as unknown as TopicSolution[])
    : []
)
const casDusageTopics = computed(() =>
  props.pageKey === 'cas-d-usages'
    ? (topics.value as unknown as TopicCasUsage[])
    : []
)

let cancelled = false
onBeforeUnmount(() => {
  cancelled = true
})

onMounted(async () => {
  const results = await Promise.allSettled(
    props.slugs.map((slug) => topicStore.load(slug))
  )
  if (cancelled) return
  results
    .filter((r) => r.status === 'rejected')
    .forEach((r) => console.warn('SimplifionsArticleTopicSpotlight: failed to load topic', (r as PromiseRejectedResult).reason))
  topics.value = results
    .filter((r): r is PromiseFulfilledResult<Topic> => r.status === 'fulfilled')
    .map((r) => r.value)
  loading.value = false
})
</script>

<style scoped>
.spotlight {
  padding: 1.5rem;
  background: var(--background-alt-beige-gris-galet);
  margin-bottom: 1.5rem;
}

/* 1 slug : commentaire à droite, carte à gauche */
.spotlight--single {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  grid-template-areas: 'cards comment';
  gap: 1.5rem;
  align-items: center;
}

/* 2+ slugs : commentaire en haut pleine largeur, cartes en row en dessous */
.spotlight--multi {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    'comment'
    'cards';
  gap: 1.25rem;
}

.spotlight__comment {
  grid-area: comment;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
}

.spotlight__cards {
  grid-area: cards;
  min-width: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.spotlight--single .spotlight__cards {
  flex-direction: column;
}

.spotlight--multi .spotlight__cards > * {
  flex: 1 1 200px;
}

.spotlight__skeleton {
  height: 120px;
  background: var(--background-alt-grey);
  border-radius: 4px;
  flex: 1 1 200px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.spotlight__comment :deep(p) {
  margin: 0;
  line-height: 1.6;
}

.spotlight__comment :deep(p + p) {
  margin-top: 0.5rem;
}

@media (max-width: 48rem) {
  .spotlight--single {
    grid-template-columns: 1fr;
    grid-template-areas:
      'cards'
      'comment';
  }
}
</style>
