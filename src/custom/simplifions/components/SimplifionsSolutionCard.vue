<template>
  <router-link
    :to="{ name: `${pageKey}_detail`, params: { item_id: props.topic.slug } }"
    class="simplifions-card-link fr-p-0"
  >
    <div
      class="fr-card fr-enlarge-link fr-card--shadow topic-card"
      :class="{ 'topic-card--private': topic.private }"
    >
      <div class="fr-card__body">
        <div class="fr-card__content">
          <div class="fr-grid-row">
            <SimplifionsSolutionOperateurTag
              v-if="showOperateurTag && (!imageUrl || !showImage)"
              :topic-solution="topic"
            />
            <DraftTag v-if="topic.private" class="fr-ml-auto" />
          </div>
          <h3 class="fr-card__title fr-text--lead fr-mb-0">{{ topic.name }}</h3>

          <p v-if="showDescription" class="fr-card__desc">
            {{ stripFromMarkdown(topic.description.split('\n')[0]) }}
          </p>

          <div class="fr-card__end">
            <SimplifionsTags
              :topic="topic"
              :page-key="pageKey"
              :show-target-users="showTargetUsers"
              :show-fournisseurs="showFournisseurs"
              :hide-simplification="!showSimplificationTags"
              :show-categorie-de-solution="showCategorieDeSolution"
            />
            <div v-if="showArrow" class="card-arrow" aria-hidden="true">
              <span class="fr-icon-arrow-right-line" />
            </div>
          </div>
        </div>
      </div>
      <div class="fr-card__header">
        <div v-if="showImage && imageUrl" class="fr-card__img topic-image-container fr-mx-0">
          <img
            :src="imageUrl"
            :alt="topic.name"
            class="card-image fr-responsive-img fr-ratio-16x9"
          />
          <div class="topic-image-overlay"></div>
          <SimplifionsSolutionOperateurTag
            v-if="showOperateurTag"
            :topic-solution="topic"
            class="badge-absolute"
          />
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { stripFromMarkdown } from '@/utils'
import { grist } from '../grist.ts'
import type { TopicSolution } from '../model/topics'
import { inject } from 'vue'
import { articleTopicsRegistryKey } from './article/articleTopicsRegistryKey'
import DraftTag from './DraftTag.vue'
import SimplifionsSolutionOperateurTag from './SimplifionsSolutionOperateurTag.vue'
import SimplifionsTags from './SimplifionsTags.vue'

const props = withDefaults(
  defineProps<{
    topic: TopicSolution
    pageKey?: string
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
    pageKey: undefined,
    showDescription: true,
    showImage: true,
    showOperateurTag: true,
    showTargetUsers: true,
    showFournisseurs: true,
    showSimplificationTags: true,
    showCategorieDeSolution: true,
    showArrow: false
  }
)

const route = useRoute()
const pageKey = computed(() => props.pageKey ?? (route.meta.pageKey as string | undefined) ?? 'solutions')

const solution = props.topic.extras['simplifions-v2-solutions']

const imageUrl = solution?.Image?.[0] ? grist.imageUrl(solution.Image[0]) : ''

const register = inject(articleTopicsRegistryKey, undefined)
onMounted(() => register?.(props.topic.slug, 'solutions'))
</script>

<style scoped>
.simplifions-card-link {
  display: block;
  margin-bottom: 1rem;
  background: none;
}

.topic-image-container {
  position: relative;
}

.topic-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s ease;
  z-index: 1;
}

/* Badge "Simplification" positionné dans l'image */
.badge-absolute {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
}

.card-image {
  max-height: 250px;
  object-position: top center;
}

.topic-card--private {
  background-color: #f6f6f6;
  color: #6b7280; /* gris moyen */
}

.fr-card__title {
  color: var(--text-action-high-blue-france);
}
.fr-card__desc {
  color: var(--text-default-grey);
  font-size: 1rem;
}

.card-arrow {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
  color: var(--text-action-high-blue-france);
}
</style>
