<template>
  <router-link
    v-if="datagouvSlug"
    :to="{
      name: 'solutions_detail',
      params: { item_id: datagouvSlug }
    }"
    class="solution-integratrice-card-link"
  >
    <div class="solution-integratrice-card">
      <!-- Header: Solution name + badge -->
      <div class="solution-integratrice-card__header">
        <div class="solution-integratrice-card__title-row">
          <h3 class="solution-integratrice-card__title">
            {{ solution.fields.Nom }}
          </h3>
          <!-- Simplification tags (diamonds) with tag styling -->
          <div v-if="simplificationTags.length" class="fr-tags-group simplification-diamonds">
      
              <p v-for="tag in simplificationTags" :key="tag.id"
                class="fr-tag fr-tag--sm fr-m-0"
                :aria-label="tag.name"
                :title="tag.name"
              >
                {{ getShortLabelSimplificationTag(tag.name) }}
              </p>
   
        </div>
        </div>
        <SimplifionsSolutionTag :solution="solution.fields" />
      </div>

      <!-- Content: Type de solution  -->
      <div class="solution-integratrice-card__content">
        <!-- Type de solution column -->
        <div class="solution-integratrice-card__type">
          <p class="fr-mb-0 fr-text--sm">
            {{
              solution.fields.Type_de_solution?.join(' • ') || 'Non renseigné'
            }}
          </p>
        </div>
      </div>

      <!-- Arrow -->
      <div class="solution-integratrice-card__arrow">
        <span
          aria-hidden="true"
          class="fr-icon-arrow-right-line fr-icon--lg"
        ></span>
      </div>
    </div>
  </router-link>
  <div v-else class="solution-integratrice-card solution-integratrice-card--loading">
    <p class="fr-text--sm fr-mb-0">Chargement...</p>
  </div>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import { useTagsByRef } from '@/utils/tags'
import type {
  SolutionRecord
} from '../model/grist'
import TopicsAPI from '../simplifionsTopicsApi'
import SimplifionsSolutionTag from './SimplifionsSolutionTag.vue'

const props = defineProps<{
  solution: SolutionRecord
}>()

const solutionTopic = ref<Topic | undefined>(undefined)

const topicsAPI = new TopicsAPI({ version: 2 })
const solutionTag = `simplifions-v2-solutions-${props.solution.id}`
topicsAPI.getTopicByTag(solutionTag).then((topic) => {
  solutionTopic.value = topic ?? undefined
})

const datagouvSlug = computed(() => solutionTopic.value?.slug)

const topicTags = useTagsByRef('solutions', solutionTopic)

const simplificationTags = computed(() => {
  return topicTags.value.filter((tag) => tag.type === 'types-de-simplification')
})

const getShortLabelSimplificationTag = (name: string) => {
  if (name.includes('Accès facile')) return '💠'
  if (name.includes('DLNUF')) return '💠💠'
  if (name.toLowerCase().includes('proactivité')) return '💠💠💠'
  return name
}
</script>

<style scoped>
.solution-integratrice-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.solution-integratrice-card {
  background-color: white;
  border-bottom: 4px solid var(--blue-france-sun-113-625);
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.solution-integratrice-card:hover {
  background-color: #f9f9f9;
}

.solution-integratrice-card--loading {
  background-color: #f9f9f9;
  padding: 2rem;
}

.solution-integratrice-card__header {
  margin-bottom: 1rem;
}

.solution-integratrice-card__title-row {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.solution-integratrice-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-action-high-blue-france);
  margin: 0;
}

.simplification-diamonds {
  margin-left: auto;
}


.solution-integratrice-card__arrow {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

.solution-integratrice-card__arrow .fr-icon-arrow-right-line {
  color: var(--blue-france-sun-113-625);
}

.font-weight-normal {
  font-weight: normal;
}

.text-uppercase {
  text-transform: uppercase;
}

.fr-tags-group {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 767px) {
  .solution-integratrice-card__content {
    grid-template-columns: 1fr;
  }

  .solution-integratrice-card__arrow {
    position: static;
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}
</style>