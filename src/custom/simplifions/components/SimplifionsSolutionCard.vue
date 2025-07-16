<template>
  <div class="topic-card">
    <RouterLink :to="topicLink">
      <div v-if="imageUrl" class="header-topic">
        <div class="fr-card__img topic-image-container">
            <img
              :src="imageUrl"
              :alt="topic.name"
              class="fr-responsive-img fr-ratio-16x9"
            />
            <div class="topic-image-overlay" />
        </div>
      </div>
      <div class="description-topic">
        <div class="date-topic fr-text--xs fr-mb-1w fr-text--grey-500" style="text-align: right; color: #666;">
            Mis à jour {{ formatRelativeIfRecentDate(topic.last_modified) }}
          </div>
        <div class="title-topic fr-text--lead">{{ topic.name }}</div>
          <p class="fr-mb-3w fr-text--lg">
          {{ stripFromMarkdown(topic.description.split('\n')[0]) }}
          </p>
          
          <!--Texte pour préciser les usagers et les fournisseurs de service-->
          <div v-if="groupedTags['target-users']" class="fr-card__detail">
            <p class="fr-mb-1w fr-text--sm" style="white-space: normal;">
              Démarches des
              <span
                v-for="(t, index) in filteredTargetUsers"
                :key="t.id"
                class="tag-item"
              >
                <span class="font-bold">{{ t.name }}</span>
                <span
                  v-if="index < filteredTargetUsers.length - 1"
                  class="fr-mx-1v"
                  style="font-weight: normal;"
                >|</span>
              </span>
            </p>
          </div>
          <div
            v-if="groupedTags['fournisseurs-de-service']"
            class="fr-card__detail"
          >
            <p class="fr-mb-1w fr-text--sm" style="white-space: normal;">
              À destination des
              <span
                v-for="(t, index) in groupedTags['fournisseurs-de-service']"
                :key="t.id"
                class="tag-item"
              >
                <span class="font-bold">{{ t.name }}</span>
                <span
                  v-if="index < groupedTags['fournisseurs-de-service'].length - 1"
                  class="fr-mx-1v"
                  style="font-weight: normal;"
                >|</span>
              </span>
            </p>
          </div>
      <!-- Tags indiquant le type de simplification et de budget -->
          <div v-if="groupedTags['types-de-simplification']" class="simplification-group fr-mt-2w">
            <ul class="fr-badges-group">
              <li v-for="t in groupedTags['types-de-simplification']" :key="t.id">
                <TagComponent :tag="t" />
              </li>
            </ul>
          </div>
          <div v-if="groupedTags['budget']" class="budget-group">
            <ul class="fr-badges-group">
              <li v-for="t in groupedTags['budget']" :key="t.id">
                <TagComponent :tag="t" />
              </li>
            </ul>
          </div>
      </div>
   </RouterLink>
  </div>
</template>

<script setup lang="ts">
import {
  formatRelativeIfRecentDate,
  OrganizationNameWithCertificate,
  useOwnerName
} from '@datagouv/components'

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


const ownerName = useOwnerName(props.topic)

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
.owner-avatar {
  margin-bottom: -6px;
  display: inline-block;
}

.fr-card__detail,
:deep(h3) {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: inherit;
}

.topic-card-col-logo {
  max-width: 4.25rem;
}

.description p {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.topic-card {
  border: 1px solid #ebebeb;
}
.topic-card:hover {
  background-color: #f6f6f6;
  opacity: 50;
}
.header-topic {
  color: #465f9d;
  padding: 0px;
  opacity: 0px;
  min-height: 60px;
}
.title-topic {
  font-family: Marianne;
  font-size: 18px;
  font-weight: 800;
  line-height: 27px;
  text-align: left;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
  margin-bottom: 10px;
}
.author-topic {
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
}
.date-topic {
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
}
.description-topic {
  margin: 16px;
  min-height: 80px;
}
.topic-image-container {
  position: relative;
  overflow: hidden;
}
.topic-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.4); /* léger noir */
  transition: opacity 0.3s ease;
  z-index: 1;
}
.topic-card:hover .topic-image-overlay {
  opacity: 0.3;
}

</style>
