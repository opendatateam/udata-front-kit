<template>
  <div class="topic-card">
    <RouterLink :to="topicLink">
      <div class="header-topic">
      <!--Titre et description-->
        <div class="title-topic fr-text--lead">{{ topic.name }}</div>
         <p class="fr-mb-1w">
          {{ stripFromMarkdown(topic.description.split('\n')[0]) }}
        </p>
        <div class="date-topic fr-text--xs fr-mb-0 fr-text--grey-500" style="text-align: right;">
          Mis à jour {{ formatRelativeIfRecentDate(topic.last_modified) }}
        </div>

      </div>
      <!--Texte pour préciser les usagers et les fournisseurs de service-->
      <div class="description-topic">
        <div v-if="groupedTags['target-users']" class="fr-card__detail">
          <p class="fr-mb-1w" style="white-space: normal;">
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
          class="fr-card__detail fr-text--right"
        >
          <p class="fr-mb-1w" style="white-space: normal;">
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
} from '@datagouv/components'

import type { Topic } from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'

import { stripFromMarkdown } from '@/utils'
import { useTagsByRef } from '@/utils/tags'
import type { RouteLocationRaw } from 'vue-router'


const props = defineProps<{
  topic: Topic
}>()


const { pageKey } = useCurrentPageConf()

const topicRef = ref(props.topic)
const tags = useTagsByRef(pageKey, topicRef)

const topicLink: RouteLocationRaw = {
  name: `${pageKey}_detail`,
  params: { item_id: props.topic.slug }
}

// Regrouper les tags par type
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
  background-color: rgba(209, 221, 244, 0.5);
  color: #465f9d;
  padding: 16px;
  gap: 10px;
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
.date-topic {
  color: #6b7280; /* gris moyen */
}

</style>
