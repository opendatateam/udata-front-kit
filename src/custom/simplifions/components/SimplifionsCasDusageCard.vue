<template>
  <router-link
    :to="{ name: `${pageKey}_detail`, params: { item_id: props.topic.slug } }"
  >
    <div class="test_topic-card">
      <div class="header-topic">
        <!--Titre et description-->
        <div class="title-topic fr-text--lead">{{ topic.name }}</div>
        <p class="fr-mb-1w">
          {{ stripFromMarkdown(topic.description.split('\n')[0]) }}
        </p>
        <div
          class="date-topic fr-text--xs fr-mb-0 fr-text--grey-500"
          style="text-align: right"
        >
          Mis à jour {{ formatRelativeIfRecentDate(topic.last_modified) }}
        </div>
      </div>
      <!--Texte pour préciser les usagers et les fournisseurs de service-->
      <div class="description-topic">
        <SimplifionsTags :topic="topic" :page-key="pageKey" />
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { formatRelativeIfRecentDate } from '@datagouv/components'

import type { Topic } from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'

import { stripFromMarkdown } from '@/utils'
import SimplifionsTags from './SimplifionsTags.vue'

const props = defineProps<{
  topic: Topic
}>()

const { pageKey } = useCurrentPageConf()
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
.test_topic-card-col-logo {
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
.test_topic-card {
  border: 1px solid #ebebeb;
}
.test_topic-card:hover {
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
