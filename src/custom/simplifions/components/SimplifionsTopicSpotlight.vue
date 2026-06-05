<template>
  <div v-if="topic" class="spotlight">
    <div class="spotlight__card">
      <SimplifionsSolutionCard
        v-if="pageKey === 'solutions'"
        :topic="topicAsSolution"
        :page-key="pageKey"
        :show-description="showDescription"
        :show-image="showImage"
        :show-target-users="showTargetUsers"
        :show-fournisseurs="showFournisseurs"
        :show-simplification-tags="showSimplificationTags"
        :show-categorie-de-solution="showCategorieDeSolution"
      />
      <SimplifionsCasDusageCard
        v-else
        :topic="topicAsCasUsage"
        :page-key="pageKey"
        :show-description="showDescription"
        :show-target-users="showTargetUsers"
        :show-fournisseurs="showFournisseurs"
        :show-simplification-tags="showSimplificationTags"
        :show-categorie-de-solution="showCategorieDeSolution"
      />
    </div>
    <div class="spotlight__comment">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TopicCasUsage, TopicSolution } from '../model/topics'
import { useTopicsBySlug } from '../composables/useTopicsBySlug'
import SimplifionsSolutionCard from './SimplifionsSolutionCard.vue'
import SimplifionsCasDusageCard from './SimplifionsCasDusageCard.vue'

const props = withDefaults(
  defineProps<{
    slug: string
    pageKey: 'solutions' | 'cas-d-usages'
    showDescription?: boolean
    showImage?: boolean
    showTargetUsers?: boolean
    showFournisseurs?: boolean
    showSimplificationTags?: boolean
    showCategorieDeSolution?: boolean
  }>(),
  {
    showDescription: false,
    showImage: true,
    showTargetUsers: false,
    showFournisseurs: false,
    showSimplificationTags: false,
    showCategorieDeSolution: false
  }
)

const { topics } = useTopicsBySlug<TopicSolution | TopicCasUsage>([props.slug])
const topic = computed(() => topics.value[0])
const topicAsSolution = computed(() => topic.value as TopicSolution)
const topicAsCasUsage = computed(() => topic.value as TopicCasUsage)
</script>

<style scoped>
.spotlight {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--background-alt-beige-gris-galet);
  border-left: 4px solid var(--border-action-high-blue-france);
  border-radius: 0 4px 4px 0;
  margin-bottom: 1.5rem;
}

.spotlight__card {
  min-width: 0;
}

.spotlight__comment {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
}

.spotlight__comment :deep(p) {
  margin: 0;
  line-height: 1.6;
}

.spotlight__comment :deep(p + p) {
  margin-top: 0.5rem;
}

@media (max-width: 48rem) {
  .spotlight {
    grid-template-columns: 1fr;
  }
}
</style>
