<template>
  <div v-if="endpoints === undefined">
    Chargement des données en cours...
  </div>
  <div v-else-if="sortedEndpoints?.length">
    <p class="fr-mt-4w"><b><span title="Un endpoint est une sous-partie d'une API, un point d'accès spécifique à l'intérieur de l'API." style="text-decoration: underline dotted; text-underline-offset: 3px;">Endpoints</span> de l'API utiles pour ce cas d'usage :</b></p>
    <div class="fr-table fr-table--multiline fr-table--no-caption fr-table--sm">
      <div class="fr-table__header">
        <div class="fr-search-bar" role="search">
          <label class="fr-label" :for="searchId">Filtrer les endpoints</label>
          <input
            :id="searchId"
            v-model="searchQuery"
            class="fr-input"
            type="search"
            placeholder="Rechercher les endpoints utiles par mots-clés..."
          />
          <button type="button" class="fr-btn">Filtrer</button>
        </div>
      </div>
      <div class="fr-table__wrapper">
        <div class="fr-table__container">
          <div class="fr-table__content">
            <table>
              <thead>
                <tr class="">
                  <th class="fr-col--md fr-py-2w" scope="col">Endpoints utiles de l'API</th>
                  <th class="fr-col--lg fr-py-2w" scope="col">Description de l'utilité pour le cas d'usage «&nbsp;{{ caseUsageName }}&nbsp;»</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!filteredEndpoints.length">
                  <td colspan="2"><i>Aucun endpoint ne correspond à votre recherche.</i></td>
                </tr>
                <template v-else>
                  <tr
                    v-for="record in paginatedEndpoints"
                    :key="record.fields.UID_datagouv"
                    class="test__api-or-dataset-utile"
                  >
                    <td>
                      <b>{{ record.fields.Nom }}</b><br />
                      <a
                        :href="`https://www.data.gouv.fr/fr/${datagouvUrlType(record.fields)}/${record.fields.UID_datagouv}`"
                        target="_blank"
                        class="fr-link fr-link--xs"
                      >Documentation</a>
                    </td>
                    <!-- eslint-disable vue/no-v-html -->
                    <td
                      v-if="customDescriptions[record.id]?.En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage"
                      class="fr-text--sm fr-py-1w test__api-or-dataset-utile-description"
                      v-html="fromMarkdown(customDescriptions[record.id].En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage).html"
                    ></td>
                    <!-- eslint-enable vue/no-v-html -->
                    <td v-else>
                      <i class="fr-text--xs">Cet endpoint est identifié comme utile pour ce cas d'usage.</i>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div v-if="paginationPages.length > 1" class="fr-table__footer">
        <div class="fr-table__footer--start">
          <p class="fr-table__detail">{{ filteredEndpoints.length }} endpoint{{ filteredEndpoints.length > 1 ? 's' : '' }}</p>
        </div>
        <div class="fr-table__footer--middle">
          <DsfrPagination
            :pages="paginationPages"
            :current-page="currentPage"
            @update:current-page="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fromMarkdown } from '@/utils'
import type { ApiOrDataset, ApiOrDatasetRecord, ApiOrDatasetUtiles } from '../model/grist'

const props = defineProps<{
  endpoints: ApiOrDatasetRecord[] | undefined
  customDescriptions: Record<number, ApiOrDatasetUtiles>
  caseUsageName: string
}>()

const ENDPOINTS_PER_PAGE = 4

const searchId = useId()
const searchQuery = ref('')
const currentPage = ref(0)

const datagouvUrlType = (apiOrDataset: ApiOrDataset) => {
  switch (apiOrDataset.Type) {
    case 'API': return 'dataservices'
    case 'Jeu de données': return 'datasets'
    default: throw new Error(`Unknown type: ${apiOrDataset.Type}`)
  }
}

const sortedEndpoints = computed(() => {
  return props.endpoints?.slice().sort((a, b) => {
    const aCustomDescription = props.customDescriptions[a.id]
    const bCustomDescription = props.customDescriptions[b.id]

    const aOrdre =
      typeof aCustomDescription?.Ordre === 'number' ? aCustomDescription.Ordre : Infinity
    const bOrdre =
      typeof bCustomDescription?.Ordre === 'number' ? bCustomDescription.Ordre : Infinity

    if (aOrdre !== bOrdre) return aOrdre - bOrdre

    const aDescriptionLength =
      aCustomDescription
        ?.En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage?.length || 0
    const bDescriptionLength =
      bCustomDescription
        ?.En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage?.length || 0
    const lengthDiff = bDescriptionLength - aDescriptionLength
    if (lengthDiff !== 0) return lengthDiff

    return a.fields.Nom.localeCompare(b.fields.Nom)
  })
})

const filteredEndpoints = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sortedEndpoints.value ?? []
  return (sortedEndpoints.value ?? []).filter((record) => {
    const description = props.customDescriptions[record.id]?.En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage ?? ''
    return (
      record.fields.Nom.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q)
    )
  })
})

const paginatedEndpoints = computed(() => {
  const start = currentPage.value * ENDPOINTS_PER_PAGE
  return filteredEndpoints.value.slice(start, start + ENDPOINTS_PER_PAGE)
})

const paginationPages = computed(() => {
  const pageCount = Math.ceil(filteredEndpoints.value.length / ENDPOINTS_PER_PAGE)
  return Array.from({ length: pageCount }, (_, i) => ({
    label: String(i + 1),
    title: `Page ${i + 1}`,
    href: '#'
  }))
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

watch(filteredEndpoints, () => {
  currentPage.value = 0
})
</script>

<style scoped>
.fr-table .fr-table__wrapper {
  border: 1px solid var(--border-default-grey);
}

@media (min-width: 48em) {
  .fr-table__header .fr-search-bar {
    min-width: 28rem;
  }
}

.fr-text--sm :deep(p) {
  font-size: inherit;
  line-height: inherit;
}
</style>
