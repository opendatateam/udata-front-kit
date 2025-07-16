<template>
  <RouterLink :to="topicLink" class="">
    <div class="fr-card fr-enlarge-link fr-card--shadow ">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <p v-if="!imageUrl" class="fr-badge fr-badge--sm fr-mb-2w">
            <span style="font-weight: normal;">Solution publique</span>
            <span v-if="solution?.operateur_nom">
              <span class="fr-ml-1v" style="font-weight: normal;"> | </span>
              {{ solution.operateur_nom }}
            </span>
          </p>
          <h3 class="fr-card__title fr-text--lead fr-mb-0">{{ topic.name }}</h3>

          <p class="fr-card__desc fr-text--lg">
            {{ stripFromMarkdown(topic.description.split('\n')[0]) }}
          </p>

          <div class="fr-card__end">
            <!-- Usagers -->
            <div
              v-if="groupedTags['target-users']"
              class="fr-card__detail fr-text--md">
              <p class="fr-mb-1w" style="white-space: normal;">
                Démarches des&nbsp;
                <span
                  v-for="(t, index) in filteredTargetUsers"
                  :key="t.id"
                  class="tag-item"
                >
                  <strong>{{ t.name }}</strong>
                  <span v-if="index < filteredTargetUsers.length - 1" class="fr-mx-1v">|</span>
                </span>
              </p>
            </div>

            <!-- Fournisseurs de service -->
            <div
              v-if="groupedTags['fournisseurs-de-service']"
              class="fr-card__detail fr-text--md"
           
            >
            <p class="" style="white-space: normal;">
              À destination des&nbsp;
              <span
                v-for="(t, index) in groupedTags['fournisseurs-de-service']"
                :key="t.id"
                class="tag-item"
              >
                <strong>{{ t.name }}</strong>
                <span v-if="index < groupedTags['fournisseurs-de-service'].length - 1" class="fr-mx-1v">|</span>
              </span>
              </p>
            </div>

            <!-- Badges -->
            <ul v-if="groupedTags['types-de-simplification']" class="fr-badges-group">
              <li v-for="t in groupedTags['types-de-simplification']" :key="t.id">
                <TagComponent :tag="t" />
              </li>
            </ul>

            <ul v-if="groupedTags['budget']" class="fr-badges-group">
              <li v-for="t in groupedTags['budget']" :key="t.id">
                <TagComponent :tag="t" />
              </li>
            </ul>
            
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
            <span style="font-weight: normal;">Solution publique</span>
            <span v-if="solution?.operateur_nom">
              <span class="fr-ml-1v" style="font-weight: normal;"> | </span>
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
import { useTagsByRef } from '@/utils/tags'
import { stripFromMarkdown } from '@/utils'
import type { RouteLocationRaw } from 'vue-router'
import { gristImageUrl } from './simplifions_utils'


const { pageKey } = useCurrentPageConf()

const props = defineProps({
  topic: {
    type: Object as () => Topic,
    required: true
  }
})

const solution = (props.topic.extras as any)['simplifions-solutions'] as Record<string, any>

const imageUrl = solution?.Image_principale?.[0]
  ? gristImageUrl(solution.Image_principale[0])
  : ''


const topicLink: RouteLocationRaw = {
  name: `${pageKey}_detail`,
  params: { item_id: props.topic.slug }
}

// ajoute les tags sur la carte 
const topicRef = ref(props.topic)
const tags = useTagsByRef(pageKey, topicRef)

const groupedTags = computed(() => {
  const groups: Record<string, typeof tags.value> = {}
  for (const tag of tags.value) {
    if (!groups[tag.type]) {
      groups[tag.type] = []
    }
    groups[tag.type].push(tag)
  }
  return groups
})

const filteredTargetUsers = computed(() => {
  return (groupedTags.value['target-users'] || []).filter(tag => tag.name !== 'Agents publics')
})

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

