<template>
  <router-link
    v-if="datagouvSlug"
    :to="{
      name: 'solutions_detail',
      params: { item_id: datagouvSlug }
    }"
    class="integrateur-card-link"
  >
    <div class="integrateur-card">
      <!-- Header: Solution name + badge -->
      <div class="integrateur-card__header">
        <h3 class="integrateur-card__title">
          {{ solution.fields.Nom }}
        </h3>
        <p
          :class="[
            'fr-badge fr-badge--sm fr-badge--no-icon fr-mb-0',
            isPublic ? 'fr-badge--success' : 'fr-badge--info'
          ]"
        >
          <span class="font-weight-normal text-uppercase">{{ tagText }}</span>
          <span v-if="operatorName">
            <span class="fr-ml-1v font-weight-normal"> | </span>
            <span class="text-uppercase">{{ operatorName }}</span>
          </span>
        </p>
      </div>

      <!-- Content: Type de solution + Cas d'usages -->
      <div class="integrateur-card__content">
        <!-- Type de solution column -->
        <div class="integrateur-card__type">
          <p class="section-label">Type de solution :</p>
          <p class="type-value">
            {{
              solution.fields.Type_de_solution?.join(' ou ') || 'Non renseigné'
            }}
          </p>

          <!-- Simplification tags -->
          <ul v-if="simplificationTags.length" class="fr-tags-group fr-mt-2v">
            <li v-for="tag in simplificationTags" :key="tag.id">
              <p class="fr-tag fr-tag--sm">
                {{ tag.name }}
              </p>
            </li>
          </ul>

          <!-- "Avec une solution éditeur" tag if applicable -->
          <p
            v-if="solution.fields.Type_de_solution?.includes('Éditeur')"
            class="fr-tag fr-tag--sm fr-mt-1v"
          >
            Avec une solution éditeur
          </p>
        </div>

        <!-- Cas d'usages column -->
        <div class="integrateur-card__usecases">
          <p class="section-label">Cas d'usages :</p>
          <div v-if="casUsagesWithIndicators.length" class="cas-usages-grid">
            <div
              v-for="casUsage in casUsagesWithIndicators"
              :key="casUsage.id"
              class="cas-usage-card"
            >
              <div class="cas-usage-card__header">
                <span class="cas-usage-name">{{ casUsage.name }}</span>
              </div>
              <div class="cas-usage-card__indicator">
                <span :class="['indicator-count', casUsage.colorClass]">
                  {{ casUsage.integratedCount }}/{{ casUsage.totalCount }}
                </span>
                <span class="indicator-label-wrapper">
                  <span class="indicator-label"
                    >API ou jeux de données intégrés</span
                  >
                  <span class="indicator-tooltip">
                    <span :class="['indicator-count', casUsage.colorClass]"
                      >{{ casUsage.integratedCount }} API et jeux de données
                      "<strong>{{ supplierName }}</strong
                      >"</span
                    >
                    sur les {{ casUsage.totalCount }} utiles pour ce cas d'usage
                    ont été intégrés par cette solution.
                  </span>
                </span>
              </div>
            </div>
          </div>
          <p v-else class="fr-text--sm fr-mb-0 fr-text--light">
            Aucun cas d'usage associé
          </p>
        </div>
      </div>

      <!-- Arrow -->
      <div class="integrateur-card__arrow">
        <span
          aria-hidden="true"
          class="fr-icon-arrow-right-line fr-icon--lg"
        ></span>
      </div>
    </div>
  </router-link>
  <div v-else class="integrateur-card integrateur-card--loading">
    <p class="fr-text--sm fr-mb-0">Chargement...</p>
  </div>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import { useTagsByRef } from '@/utils/tags'
import type { CasUsageRecord, SolutionRecord } from '../model/grist'
import TopicsAPI from '../simplifionsTopicsApi'

const props = defineProps<{
  solution: SolutionRecord
  availableApisOrDatasets: number[]
  casUsages: CasUsageRecord[]
  usefulApisByCasUsage: Map<number, number[]>
  supplierName: string
}>()

const solutionTopic = ref<Topic | undefined>(undefined)

const topicsAPI = new TopicsAPI({ version: 2 })
const solutionTag = `simplifions-v2-solutions-${props.solution.id}`
topicsAPI.getTopicByTag(solutionTag).then((topic) => {
  solutionTopic.value = topic ?? undefined
})

const datagouvSlug = computed(() => solutionTopic.value?.slug)

const isPublic = computed(() => {
  return props.solution.fields.Public_ou_prive === 'Public'
})

const tagText = computed(() => {
  return isPublic.value ? 'Solution publique' : 'Solution privée'
})

const operatorName = computed(() => {
  return props.solution.fields.Nom_de_l_operateur?.[0]
})

const topicTags = useTagsByRef('solutions', solutionTopic)

const simplificationTags = computed(() => {
  return topicTags.value.filter((tag) => tag.type === 'types-de-simplification')
})

const casUsagesWithIndicators = computed(() => {
  const recommendedCasUsages =
    props.solution.fields.Recommande_pour_les_cas_d_usages || []
  const integratedApis = props.solution.fields.API_ou_datasets_integres || []

  return recommendedCasUsages
    .map((casUsageId) => {
      const casUsage = props.casUsages.find((cu) => cu.id === casUsageId)
      if (!casUsage) return null

      // Get the useful APIs for this specific use case (Y value)
      // Falls back to all available APIs if no specific recommendation exists
      const usefulApisForCasUsage =
        props.usefulApisByCasUsage.get(casUsageId) ||
        props.availableApisOrDatasets
      const totalCount = usefulApisForCasUsage.length

      // Count how many of the useful APIs this solution has integrated (X value)
      const integratedCount = integratedApis.filter((apiId) =>
        usefulApisForCasUsage.includes(apiId)
      ).length

      // Color class based on percentage (red → orange → yellow → green)
      const percentage =
        totalCount === 0 ? 0 : (integratedCount / totalCount) * 100
      let colorClass = 'indicator--red'
      if (percentage >= 75) colorClass = 'indicator--green'
      else if (percentage >= 50) colorClass = 'indicator--yellow'
      else if (percentage >= 25) colorClass = 'indicator--orange'

      return {
        id: casUsageId,
        name: casUsage.fields.Nom_complet || casUsage.fields.Nom,
        icon: casUsage.fields.Icone_du_titre || '📋',
        integratedCount,
        totalCount,
        colorClass
      }
    })
    .filter(Boolean) as Array<{
    id: number
    name: string
    icon: string
    integratedCount: number
    totalCount: number
    colorClass: string
  }>
})
</script>

<style scoped>
.integrateur-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.integrateur-card {
  background-color: white;
  border-bottom: 4px solid var(--blue-france-sun-113-625);
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.integrateur-card:hover {
  background-color: #f9f9f9;
}

.integrateur-card--loading {
  background-color: #f9f9f9;
  padding: 2rem;
}

.integrateur-card__header {
  margin-bottom: 1rem;
}

.integrateur-card__title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-action-high-blue-france);
  margin: 0 0 0.5rem 0;
}

.integrateur-card__content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
}

.section-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #161616;
  margin-bottom: 0.25rem;
}

.type-value {
  font-size: 0.875rem;
  color: #161616;
  margin-bottom: 0;
}

.integrateur-card__arrow {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

.integrateur-card__arrow .fr-icon-arrow-right-line {
  color: var(--blue-france-sun-113-625);
}

.cas-usages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.cas-usage-card {
  background-color: #e3e3fd;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
}

.cas-usage-card__header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.cas-usage-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #161616;
  line-height: 1.3;
}

.cas-usage-card__indicator {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  margin-top: auto;
  background-color: #f6f6f6;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.indicator-label-wrapper {
  position: relative;
  display: inline-block;
}

.indicator-label {
  font-size: 0.75rem;
  color: #666;
  text-decoration: underline dotted;
  text-underline-offset: 2px;
  cursor: help;
}

.indicator-tooltip {
  display: none;
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 4px;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  font-size: 0.875rem;
  color: var(--grey-50-1000);
  width: max-content;
  max-width: 20rem;
  z-index: 1000;
  line-height: 1.4;
}

.indicator-tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: white;
}

.indicator-label-wrapper:hover .indicator-tooltip {
  display: block;
}

.indicator-count {
  font-weight: 700;
}

.indicator-count.indicator--green {
  background-color: rgb(184, 254, 201);
}

.indicator-count.indicator--yellow {
  background-color: rgb(254, 240, 184);
}

.indicator-count.indicator--orange {
  background-color: rgb(254, 224, 184);
}

.indicator-count.indicator--red {
  background-color: rgb(254, 201, 201);
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
  .integrateur-card__content {
    grid-template-columns: 1fr;
  }

  .integrateur-card__arrow {
    position: static;
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e5e5;
  }

  .cas-usages-grid {
    grid-template-columns: 1fr;
  }
}
</style>
