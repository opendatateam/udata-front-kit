<template>
  <div v-if="topics.length > 0" class="spotlight" :class="isMulti ? 'spotlight--multi' : 'spotlight--single'">
    <div class="spotlight__comment">
      <slot />
    </div>
    <div class="spotlight__cards">
      <template v-for="topic in topics" :key="topic.id">
        <SimplifionsSolutionCard
          v-if="pageKey === 'solutions'"
          :topic="(topic as unknown as TopicSolution)"
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
          v-else
          :topic="(topic as unknown as TopicCasUsage)"
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
import type { TopicCasUsage, TopicSolution } from '../../model/topics'
import { useTopicsBySlug } from '../../composables/useTopicsBySlug'
import { inject } from 'vue'
import { articleTopicsRegistryKey } from './articleTopicsRegistryKey'
import SimplifionsSolutionCard from '../SimplifionsSolutionCard.vue'
import SimplifionsCasDusageCard from '../SimplifionsCasDusageCard.vue'

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
    showImage: true,
    showOperateurTag: true,
    showTargetUsers: false,
    showFournisseurs: false,
    showSimplificationTags: false,
    showCategorieDeSolution: false,
    showArrow: false
  }
)

const { topics } = useTopicsBySlug(props.slugs)
const isMulti = computed(() => props.slugs.length >= 2)

const register = inject(articleTopicsRegistryKey)
onMounted(() => {
  props.slugs.forEach((slug) => register?.(slug, props.pageKey))
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
  grid-template-areas: "cards comment";
  gap: 1.5rem;
  align-items: center;
}

/* 2+ slugs : commentaire en haut pleine largeur, cartes en row en dessous */
.spotlight--multi {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "comment"
    "cards";
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
      "cards"
      "comment";
  }
}
</style>
