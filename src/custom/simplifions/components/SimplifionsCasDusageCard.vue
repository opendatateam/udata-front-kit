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
        <div
          v-if="showArrow && !hasDetails"
          class="card-arrow"
          aria-hidden="true"
        >
          <span class="fr-icon-arrow-right-line" />
        </div>
      </div>
      <!--Texte pour préciser les usagers et les fournisseurs de service-->
      <div v-if="hasDetails" class="description-topic">
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
import { stripFromMarkdown } from '@/utils'
import { useRoute } from 'vue-router'
import type { TopicCasUsage } from '../model/topics'
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
  () =>
    props.pageKey ??
    (route.meta.pageKey as string | undefined) ??
    'cas-d-usages'
)

const hasDetails = computed(
  () =>
    props.showTargetUsers ||
    props.showFournisseurs ||
    props.showSimplificationTags ||
    props.showCategorieDeSolution
)
</script>

<style scoped>
.simplifions-card-link {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  background: none;
}

.topic-card {
  border: 1px solid var(--border-default-grey);
  background-color: var(--background-default-grey);
  display: flex;
  flex-direction: column;
  flex: 1;
}
.topic-card:hover {
  background-color: var(--background-alt-grey);
}
.header-topic {
  background-color: rgba(209, 221, 244, 0.5);
  color: #465f9d;
  padding: 16px;
  gap: 10px;
  min-height: 60px;
}
.topic-card:hover .header-topic {
  background-color: rgba(188, 199, 219, 0.5);
}
.topic-card:hover .description-topic {
  background-color: var(--background-alt-grey);
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
  color: var(--text-mention-grey);
}
.description-topic {
  padding: 16px;
  min-height: 80px;
}

.card-arrow {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 1rem 0.5rem;
  color: var(--text-action-high-blue-france);
}

.topic-card--private .header-topic {
  background-color: var(--background-alt-grey);
  color: var(--text-mention-grey); /* gris moyen */
}
.topic-card--private:hover .header-topic {
  background-color: var(--background-alt-grey);
  color: var(--text-mention-grey);
}
</style>
