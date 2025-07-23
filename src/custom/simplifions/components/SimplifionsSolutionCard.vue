<template>
  <RouterLink :to="topicLink" class="">
    <div class="fr-card fr-enlarge-link fr-card--shadow">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <p v-if="!imageUrl" class="fr-badge fr-badge--sm fr-mb-2w">
            <span style="font-weight: normal">Solution publique</span>
            <span v-if="solution?.operateur_nom">
              <span class="fr-ml-1v" style="font-weight: normal"> | </span>
              {{ solution.operateur_nom }}
            </span>
          </p>
          <h3 class="fr-card__title fr-text--lead fr-mb-0">{{ topic.name }}</h3>

          <p class="fr-card__desc fr-text--lg">
            {{ stripFromMarkdown(topic.description.split('\n')[0]) }}
          </p>

          <div class="fr-card__end">
            <SimplifionsTags :topic="topic" :page-key="pageKey" />
          </div>
        </div>
      </div>
      <div class="fr-card__header">
        <div v-if="imageUrl" class="fr-card__img topic-image-container fr-mx-0">
          <img
            :src="imageUrl"
            :alt="topic.name"
            class="fr-responsive-img fr-ratio-16x9"
          />
          <div class="topic-image-overlay"></div>
          <p class="fr-badge fr-badge--sm badge-absolute">
            <span style="font-weight: normal">Solution publique</span>
            <span v-if="solution?.operateur_nom">
              <span class="fr-ml-1v" style="font-weight: normal"> | </span>
              {{ solution.operateur_nom }}
            </span>
          </p>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'
import { stripFromMarkdown } from '@/utils'
import type { RouteLocationRaw } from 'vue-router'
import type { SimplifionsSolutionsExtras } from '../model/solution'
import { gristImageUrl } from './simplifions_utils'
import SimplifionsTags from './SimplifionsTags.vue'

const { pageKey } = useCurrentPageConf()

const props = defineProps({
  topic: {
    type: Object as () => Topic,
    required: true
  }
})

const solution = (props.topic.extras as SimplifionsSolutionsExtras)[
  'simplifions-solutions'
]

const imageUrl = solution?.Image_principale?.[0]
  ? gristImageUrl(solution.Image_principale[0])
  : ''

const topicLink: RouteLocationRaw = {
  name: `${pageKey}_detail`,
  params: { item_id: props.topic.slug }
}
</script>

<style scoped>
.topic-image-container {
  position: relative;
}

.topic-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  transition: opacity 0.3s ease;
  z-index: 1;
}

.topic-card:hover .topic-image-overlay {
  opacity: 0.3;
}

/* Badge "Simplification" positionné dans l'image */
.badge-absolute {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
}
</style>
