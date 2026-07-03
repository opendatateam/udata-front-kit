<template>
  <router-link
    :to="{ name: `${pageKey}_detail`, params: { item_id: topic.slug } }"
    class="simplifions-card-link fr-p-0"
  >
    <div class="topic-card" :class="{ 'topic-card--private': topic.private }">
      <div class="header-topic">
        <!--Titre et description-->
        <h3 class="title-topic fr-text--lead">
          {{ topic.name }}
        </h3>
        <p v-if="showDescription" class="fr-mb-1w">
          {{ stripFromMarkdown(topic.description.split('\n')[0]) }}
        </p>
        <div class="date-topic fr-grid-row fr-grid-row--right fr-mt-1w">
          <DraftTag v-if="topic.private" class="fr-mr-1v" />
        </div>
        <div v-if="showArrow && !hasTagSection" class="card-arrow" aria-hidden="true">
          <span class="fr-icon-arrow-right-line" />
        </div>
      </div>
      <!--Texte pour préciser les usagers et les fournisseurs de service-->
      <div v-if="hasTagSection" class="description-topic">
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
  </router-link>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { stripFromMarkdown } from '@/utils'
import type { TopicCasUsage } from '../model/topics'
import { inject } from 'vue'
import { articleTopicsRegistryKey } from './article/articleTopicsRegistryKey'
import DraftTag from './DraftTag.vue'
import SimplifionsTags from './SimplifionsTags.vue'

const props = withDefaults(
  defineProps<{
    topic: TopicCasUsage
    pageKey?: string
    showDescription?: boolean
    showTargetUsers?: boolean
    showFournisseurs?: boolean
    showSimplificationTags?: boolean
    showCategorieDeSolution?: boolean
    showArrow?: boolean
  }>(),
  {
    pageKey: undefined,
    showDescription: true,
    showTargetUsers: true,
    showFournisseurs: true,
    showSimplificationTags: true,
    showCategorieDeSolution: true,
    showArrow: false
  }
)

const route = useRoute()
const pageKey = computed(
  () => props.pageKey ?? (route.meta.pageKey as string | undefined) ?? 'cas-d-usages'
)
const hasTagSection = computed(
  () => props.showTargetUsers || props.showFournisseurs || props.showSimplificationTags || props.showCategorieDeSolution
)

const register = inject(articleTopicsRegistryKey, undefined)
onMounted(() => register?.(props.topic.slug, 'cas-d-usages'))
</script>

<style scoped>
.simplifions-card-link {
  display: block;
  margin-bottom: 1rem;
  background: none;
}

.owner-avatar {
  margin-bottom: -6px;
  display: inline-block;
}
.fr-card__detail {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: inherit;
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
.topic-card:hover .header-topic {
  background-color: rgba(188, 199, 219, 0.5);
}
.title-topic {
  font-family: Marianne;
  color: #465f9d;
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

.card-arrow {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 1rem 0.5rem;
  color: var(--text-action-high-blue-france);
}

.topic-card--private .header-topic {
  background-color: #f6f6f6;
  color: #666; /* gris moyen */
}
.topic-card--private:hover .header-topic {
  background-color: #e7e7e7 !important;
  color: #666; /* gris moyen */
}
</style>
