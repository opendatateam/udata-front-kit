<template>
  <router-link
    v-if="datagouvSlug"
    :to="{
      name: 'solutions_detail',
      params: { item_id: datagouvSlug }
    }"
    class="integrateur-card-link"
  >
    <div class="integrateur-card fr-p-3w">
      <!-- Header: Solution name + badge -->
      <div class="fr-mb-2w">
        <h3 class="fr-h5 fr-mb-1w integrateur-card__title">
          {{ solution.fields.Nom }}
        </h3>
        <p
          :class="[
            'fr-badge fr-badge--sm fr-badge--no-icon fr-mb-0',
            isPublic ? 'fr-badge--success' : 'fr-badge--info'
          ]"
        >
          <span class="font-weight-normal uppercase">{{ tagText }}</span>
          <span v-if="operatorName">
            <span class="fr-ml-1v font-weight-normal"> | </span>
            <span class="uppercase">{{ operatorName }}</span>
          </span>
        </p>
      </div>

      <!-- Content: Type de solution + Cas d'usages -->
      <div class="fr-grid-row fr-grid-row--gutters">
        <!-- Type de solution column -->
        <div class="fr-col-12 fr-col-md-4">
          <p class="fr-text--sm fr-text--bold fr-mb-1v">Type de solution :</p>
          <p class="fr-text--sm fr-mb-0">
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
        <div
          v-if="casUsagesWithIndicators.length"
          class="fr-col-12 fr-col-md-8"
        >
          <p class="fr-text--sm fr-text--bold fr-mb-1v">Cas d'usages :</p>
          <div class="cas-usages-grid">
            <div
              v-for="casUsage in casUsagesWithIndicators"
              :key="casUsage.id"
              class="cas-usage-card fr-p-2v"
            >
              <span class="fr-text--xs fr-text--bold fr-mb-1v">{{
                casUsage.name
              }}</span>
              <div class="cas-usage-card__indicator fr-p-1w">
                <span
                  :class="[
                    'fr-text--sm fr-text--bold indicator-count',
                    casUsage.colorClass
                  ]"
                >
                  {{ casUsage.integratedCount }}/{{ casUsage.totalCount }}
                </span>
                <TooltipWrapper>
                  <template #trigger>
                    <span class="fr-text--xs indicator-label"
                      >API ou jeux de données intégrés</span
                    >
                  </template>
                  <span
                    :class="[
                      'fr-text--sm fr-text--bold indicator-count',
                      casUsage.colorClass
                    ]"
                    >{{ casUsage.integratedCount }} API et jeux de données
                    "<strong>{{ nomFournisseur }}</strong
                    >"</span
                  >
                  sur les {{ casUsage.totalCount }} utiles pour ce cas d'usage
                  ont été intégrés par cette solution.
                </TooltipWrapper>
              </div>
            </div>
          </div>
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
  <div v-else class="integrateur-card integrateur-card--loading fr-p-3w">
    <p class="fr-text--sm fr-mb-0">Chargement...</p>
  </div>
</template>

<script setup lang="ts">
import TooltipWrapper from '@/components/TooltipWrapper.vue'
import type { Topic } from '@/model/topic'
import { useTagsByRef } from '@/utils/tags'
import type {
  ApiEtDatasetsIntegresRecord,
  CasUsageRecord,
  SolutionRecord
} from '../model/grist'
import TopicsAPI from '../simplifionsTopicsApi'

const props = defineProps<{
  solution: SolutionRecord
  casUsages: CasUsageRecord[]
  usefulApisByCasUsage: Map<number, number[]>
  nomFournisseur: string
  apiEtDatasetsIntegres: ApiEtDatasetsIntegresRecord[]
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
  // Extract unique use case IDs from integration data
  const useCaseIds = new Set<number>()
  props.apiEtDatasetsIntegres.forEach((integration) => {
    integration.fields.Integre_pour_les_cas_d_usages?.forEach((id) => {
      useCaseIds.add(id)
    })
  })

  return Array.from(useCaseIds).flatMap((casUsageId) => {
    const casUsage = props.casUsages.find((cu) => cu.id === casUsageId)
    if (!casUsage) return []

    // Y = useful APIs for this use case (from supplier's recommendations)
    const usefulApisForCasUsage = props.usefulApisByCasUsage.get(casUsageId)
    // Skip use cases not in supplier's recommendations
    if (!usefulApisForCasUsage?.length) return []

    // X = count of APIs integrated for this use case
    const integratedCount = props.apiEtDatasetsIntegres.filter(
      (integration) =>
        integration.fields.Integre_pour_les_cas_d_usages?.includes(
          casUsageId
        ) &&
        usefulApisForCasUsage.includes(
          integration.fields.API_ou_dataset_integre
        )
    ).length

    // Color class based on percentage (red → orange → yellow → green)
    const totalCount = usefulApisForCasUsage.length
    const percentage = (integratedCount / totalCount) * 100
    let colorClass = 'indicator--red'
    if (percentage >= 75) colorClass = 'indicator--green'
    else if (percentage >= 50) colorClass = 'indicator--yellow'
    else if (percentage >= 25) colorClass = 'indicator--orange'

    return [
      {
        id: casUsageId,
        name: casUsage.fields.Nom_complet || casUsage.fields.Nom,
        icon: casUsage.fields.Icone_du_titre || '📋',
        integratedCount,
        totalCount,
        colorClass
      }
    ]
  })
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
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.integrateur-card:hover {
  background-color: var(--background-alt-grey);
}

.integrateur-card--loading {
  background-color: var(--background-alt-grey);
}

.integrateur-card__title {
  color: var(--text-action-high-blue-france);
}

.integrateur-card__arrow {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  color: var(--blue-france-sun-113-625);
}

.cas-usages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.cas-usage-card {
  background-color: var(--background-action-low-blue-france);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.cas-usage-card__indicator {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: auto;
  background-color: var(--background-alt-grey);
  border-radius: 4px;
}

.cas-usage-card__indicator > * {
  margin: 0 !important;
}

.indicator-label {
  color: var(--text-mention-grey);
  text-decoration: underline dotted;
  text-underline-offset: 2px;
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

@media (max-width: 767px) {
  .integrateur-card__arrow {
    position: static;
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-default-grey);
  }

  .cas-usages-grid {
    grid-template-columns: 1fr;
  }
}
</style>
