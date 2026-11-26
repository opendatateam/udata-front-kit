<script lang="ts" setup>
import { computed, ref } from 'vue'

import JusticeSection from '@/custom/justice/components/JusticeSection.vue'
import TimeSeriesChart from '@/custom/justice/components/TimeSeriesChart.vue'
import VizCard from '@/custom/justice/components/VizCard.vue'
import {
  BLUE,
  PURPLE,
  RED,
  type ChartSeries
} from '@/custom/justice/utils/chartTheme'
import { SAMPLE_DATASET_ID } from '@/custom/justice/utils/dataset'
import { useSectionLoader } from '@/custom/justice/utils/sectionLoader'
import {
  cellNumber,
  fetchResourceRows,
  findRow,
  yearColumns,
  type TabularRow
} from '@/custom/justice/utils/tabular'

const RESOURCE_ID = 'f3794b99-7e3d-4cb9-9d57-1f8a508ead98'
const AFFAIRES_AU_FOND = 'toutes_affaires_nouvelles_affaires_au_fond'
const REFERES = 'toutes_affaires_nouvelles_referes'
const DUREE_ENSEMBLE = 'duree_moyenne_mois_affaires_au_fond_referes'
const DUREE_FOND = 'duree_moyenne_mois_affaires_au_fond'
const DUREE_REFERES = 'duree_moyenne_mois_referes'

const rows = ref<TabularRow[]>([])

const years = computed(() => yearColumns(rows.value))
const labels = computed(() => years.value.map(String))

function valuesFor(category: string): (number | null)[] {
  const row = findRow(rows.value, category)
  return years.value.map((year) => cellNumber(row, year))
}

const volume = computed<ChartSeries[]>(() => [
  {
    label: 'Affaires au fond',
    color: BLUE,
    data: valuesFor(AFFAIRES_AU_FOND)
  },
  {
    label: 'Référés',
    color: PURPLE,
    data: valuesFor(REFERES)
  }
])

const durations = computed<ChartSeries[]>(() => [
  {
    label: 'Au fond et référés',
    color: BLUE,
    kind: 'line',
    data: valuesFor(DUREE_ENSEMBLE)
  },
  {
    label: 'Affaires au fond',
    color: PURPLE,
    kind: 'line',
    data: valuesFor(DUREE_FOND)
  },
  {
    label: 'Référés',
    color: RED,
    kind: 'line',
    data: valuesFor(DUREE_REFERES)
  }
])

const { loading, error } = useSectionLoader(async () => {
  rows.value = await fetchResourceRows(RESOURCE_ID)
})
</script>

<template>
  <JusticeSection
    title="Combien d’affaires civiles arrivent devant les tribunaux ?"
    description="Loyers impayés, séparations, tutelles, conflits de voisinage… Chaque année, des milliers de litiges du quotidien sont portés devant les tribunaux judiciaires. Découvrez leur nombre et le temps qu’il faut, en moyenne, pour les juger."
    :loading="loading"
    :error="error"
  >
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-6">
        <VizCard
          :dataset-id="SAMPLE_DATASET_ID"
          title="1,4 million d’affaires nouvelles en 2024"
          source-id="sources-affaires-nouvelles"
          source="Les affaires au fond sont jugées sur le principal. Les référés relèvent de l’urgence. Empilées, ces deux séries donnent le volume d’affaires nouvelles enregistrées chaque année entre 2020 et 2024."
        >
          <TimeSeriesChart
            :labels="labels"
            :series="volume"
            stacked
            y-title="Nombre d'affaires"
            accessible-label="Histogramme empilé des affaires nouvelles au fond et des référés, de 2020 à 2024"
            :height="320"
          />
        </VizCard>
      </div>
      <div class="fr-col-12 fr-col-md-6">
        <VizCard
          :dataset-id="SAMPLE_DATASET_ID"
          title="Délais de jugement"
          source-id="sources-durees"
          source="La durée moyenne est exprimée en mois. La courbe « Au fond et référés » réunit les deux procédures. Les affaires au fond prennent plus de temps que les référés, traités en urgence. Les valeurs couvrent les années 2020 à 2024."
        >
          <TimeSeriesChart
            :labels="labels"
            :series="durations"
            value-format="month"
            y-title="Durée moyenne (mois)"
            accessible-label="Courbes de la durée moyenne de traitement des affaires au fond, des référés, et des deux réunis, de 2020 à 2024"
            :height="320"
          />
        </VizCard>
      </div>
    </div>
    <div class="fr-mt-4w">
      <p>
        <em
          >Le nombre d’affaires a augmenté d’environ 20% depuis 2020, avec une
          baisse du temps de traitement de 1 à 2 mois.</em
        >
      </p>
    </div>
  </JusticeSection>
</template>
