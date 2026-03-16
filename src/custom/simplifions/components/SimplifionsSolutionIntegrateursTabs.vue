<template>
  <DsfrTabs
    v-model="activeTab"
    tab-list-name="Catégories de solutions intégratrices"
    :tab-titles="tabTitles"
    class="fr-mt-4w"
  >
    <DsfrTabContent
      v-if="filteredLogicielsMetiers.length"
      panel-id="tab-content-logiciel-metier"
      tab-id="tab-logiciel-metier"
      class="fr-tabs__panel--white"
    >
      <ul
        class="fr-grid-row fr-grid-row--gutters list-none list--beige-gris-galet"
      >
        <li
          v-for="integrateur in filteredLogicielsMetiers"
          :key="integrateur.id"
          class="fr-col-12 fr-mb-2w"
        >
          <SimplifionsIntegrateurCard
            :solution="integrateur"
            :cas-usages="casUsages"
            :useful-apis-by-cas-usage="usefulApisByCasUsage"
            :nom-fournisseur="nomFournisseur"
            :api-et-datasets-integres="
              apiEtDatasetsIntegresParSolution.get(integrateur.id) || []
            "
          />
        </li>
      </ul>
    </DsfrTabContent>

    <DsfrTabContent
      v-if="filteredBriquesTechniques.length"
      panel-id="tab-content-brique-technique"
      tab-id="tab-brique-technique"
      class="fr-tabs__panel--white"
    >
      <ul
        class="fr-grid-row fr-grid-row--gutters list-none list--beige-gris-galet"
      >
        <li
          v-for="integrateur in filteredBriquesTechniques"
          :key="integrateur.id"
          class="fr-col-12 fr-mb-2w"
        >
          <SimplifionsIntegrateurCard
            :solution="integrateur"
            :cas-usages="casUsages"
            :useful-apis-by-cas-usage="usefulApisByCasUsage"
            :nom-fournisseur="nomFournisseur"
            :api-et-datasets-integres="
              apiEtDatasetsIntegresParSolution.get(integrateur.id) || []
            "
          />
        </li>
      </ul>
    </DsfrTabContent>

    <DsfrTabContent
      v-if="filteredPortailsConsultation.length"
      panel-id="tab-content-portail-consultation"
      tab-id="tab-portail-consultation"
      class="fr-tabs__panel--white"
    >
      <ul
        class="fr-grid-row fr-grid-row--gutters list-none list--beige-gris-galet"
      >
        <li
          v-for="integrateur in filteredPortailsConsultation"
          :key="integrateur.id"
          class="fr-col-12 fr-mb-2w"
        >
          <SimplifionsIntegrateurCard
            :solution="integrateur"
            :cas-usages="casUsages"
            :useful-apis-by-cas-usage="usefulApisByCasUsage"
            :nom-fournisseur="nomFournisseur"
            :api-et-datasets-integres="
              apiEtDatasetsIntegresParSolution.get(integrateur.id) || []
            "
          />
        </li>
      </ul>
    </DsfrTabContent>
  </DsfrTabs>
</template>

<script setup lang="ts">
import type {
  ApiEtDatasetsIntegresRecord,
  CasUsageRecord,
  SolutionRecord
} from '../model/grist'
import SimplifionsIntegrateurCard from './SimplifionsIntegrateurCard.vue'

const props = defineProps<{
  solutions: SolutionRecord[]
  casUsages: CasUsageRecord[]
  usefulApisByCasUsage: Map<number, number[]>
  nomFournisseur: string
  apiEtDatasetsIntegresParSolution: Map<number, ApiEtDatasetsIntegresRecord[]>
}>()

const activeTab = ref(0)

const filteredLogicielsMetiers = computed(() =>
  props.solutions.filter((sol) =>
    sol.fields.liste_categories_de_solution.includes('Logiciel métier')
  )
)

const filteredBriquesTechniques = computed(() =>
  props.solutions.filter((sol) =>
    sol.fields.liste_categories_de_solution.includes('Brique technique')
  )
)

const filteredPortailsConsultation = computed(() =>
  props.solutions.filter((sol) =>
    sol.fields.liste_categories_de_solution.includes('Portail de consultation')
  )
)

const tabTitles = computed(() => {
  const titles = []
  if (filteredLogicielsMetiers.value.length > 0) {
    titles.push({
      title: `Logiciels métiers (${filteredLogicielsMetiers.value.length}) 💠💠💠`,
      tabId: 'tab-logiciel-metier',
      panelId: 'tab-content-logiciel-metier'
    })
  }
  if (filteredBriquesTechniques.value.length > 0) {
    titles.push({
      title: `Briques techniques (${filteredBriquesTechniques.value.length}) 💠💠💠`,
      tabId: 'tab-brique-technique',
      panelId: 'tab-content-brique-technique'
    })
  }
  if (filteredPortailsConsultation.value.length > 0) {
    titles.push({
      title: `Portails de consultation (${filteredPortailsConsultation.value.length})`,
      tabId: 'tab-portail-consultation',
      panelId: 'tab-content-portail-consultation'
    })
  }
  return titles
})

watch(tabTitles, () => {
  activeTab.value = 0
})
</script>

<style scoped>
.fr-tabs__panel--white {
  background-color: white;
}

.list--beige-gris-galet {
  background-color: var(--background-alt-beige-gris-galet);
}
</style>
