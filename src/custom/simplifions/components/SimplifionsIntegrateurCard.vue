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
                <span v-if="tag.icon" class="fr-mr-1v">{{ tag.icon }}</span>
                {{ tag.label }}
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
                <span v-if="casUsage.icon" class="cas-usage-icon">{{
                  casUsage.icon
                }}</span>
                <span class="cas-usage-name">{{ casUsage.name }}</span>
              </div>
              <div class="cas-usage-card__indicator">
                <IntegrationIndicator
                  :integrated-count="casUsage.integratedCount"
                  :total-count="casUsage.totalCount"
                />
                <span class="indicator-label"
                  >API ou jeux de données intégrés</span
                >
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
import type { CasUsageRecord, SolutionRecord } from '../model/grist'
import TopicsAPI from '../simplifionsTopicsApi'
import IntegrationIndicator from './IntegrationIndicator.vue'

const props = defineProps<{
  solution: SolutionRecord
  availableApisOrDatasets: number[]
  casUsages: CasUsageRecord[]
  usefulApisByCasUsage: Map<number, number[]>
}>()

const datagouvSlug = ref<string | undefined>(undefined)

const topicsAPI = new TopicsAPI({ version: 2 })
const solutionTag = `simplifions-v2-solutions-${props.solution.id}`
topicsAPI.getTopicByTag(solutionTag).then((topic) => {
  datagouvSlug.value = topic?.slug
})

const isPublic = computed(() => {
  return props.solution.fields.Public_ou_prive === 'Public'
})

const tagText = computed(() => {
  return isPublic.value ? 'Solution publique' : 'Solution privée'
})

const operatorName = computed(() => {
  return props.solution.fields.Nom_de_l_operateur?.[0]
})

const simplificationTags = computed(() => {
  const tags: Array<{ id: string; label: string; icon?: string }> = []

  // Check if the solution has specific simplification types based on the data
  if (props.solution.fields.Types_de_simplification?.length) {
    // Add a generic tag for DLNUF if present
    tags.push({
      id: 'dlnuf',
      label:
        "Dites-le nous une fois | L'usager n'a plus à fournir de justificatifs",
      icon: '💎'
    })
  }

  return tags
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

      return {
        id: casUsageId,
        name: casUsage.fields.Nom_complet || casUsage.fields.Nom,
        icon: casUsage.fields.Icone_du_titre || '📋',
        integratedCount,
        totalCount
      }
    })
    .filter(Boolean) as Array<{
    id: number
    name: string
    icon: string
    integratedCount: number
    totalCount: number
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.cas-usage-card {
  background-color: #e3e3fd;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  min-width: 200px;
  max-width: 300px;
  flex: 1;
}

.cas-usage-card__header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.cas-usage-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.cas-usage-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #161616;
  line-height: 1.3;
}

.cas-usage-card__indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.indicator-label {
  font-size: 0.75rem;
  color: #666;
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
    flex-direction: column;
  }

  .cas-usage-card {
    max-width: none;
  }
}
</style>
