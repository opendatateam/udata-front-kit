<script lang="ts" setup>
import type { DatasetV2WithFullObject } from '@datagouv/components-next'
import { computed, onMounted, ref } from 'vue'

import JusticeSection from '@/custom/justice/components/JusticeSection.vue'
import TimeSeriesChart from '@/custom/justice/components/TimeSeriesChart.vue'
import VizCard from '@/custom/justice/components/VizCard.vue'
import {
  ACTIVITY_YEARS,
  fetchActivityRows,
  valuesFor,
  type ActivityRow
} from '@/custom/justice/utils/activityData'
import {
  BLUE,
  PURPLE,
  RED,
  type ChartSeries
} from '@/custom/justice/utils/chartTheme'
import { loadJusticeDataset } from '@/custom/justice/utils/dataset'

const AFFAIRES_AU_FOND = 'toutes_affaires_nouvelles_affaires_au_fond'
const REFERES = 'toutes_affaires_nouvelles_referes'
const DUREE_ENSEMBLE = 'duree_moyenne_mois_affaires_au_fond_referes'
const DUREE_FOND = 'duree_moyenne_mois_affaires_au_fond'
const DUREE_REFERES = 'duree_moyenne_mois_referes'

const labels = ACTIVITY_YEARS.map(String)
const rows = ref<ActivityRow[]>([])
const dataset = ref<DatasetV2WithFullObject | null>(null)
const error = ref(false)
const loading = ref(true)

const volume = computed<ChartSeries[]>(() => [
  {
    label: 'Affaires au fond',
    color: BLUE,
    data: valuesFor(rows.value, AFFAIRES_AU_FOND)
  },
  {
    label: 'Référés',
    color: PURPLE,
    data: valuesFor(rows.value, REFERES)
  }
])

const durations = computed<ChartSeries[]>(() => [
  {
    label: 'Au fond et référés',
    color: BLUE,
    kind: 'line',
    data: valuesFor(rows.value, DUREE_ENSEMBLE)
  },
  {
    label: 'Affaires au fond',
    color: PURPLE,
    kind: 'line',
    data: valuesFor(rows.value, DUREE_FOND)
  },
  {
    label: 'Référés',
    color: RED,
    kind: 'line',
    data: valuesFor(rows.value, DUREE_REFERES)
  }
])

onMounted(async () => {
  try {
    const [activityRows, loadedDataset] = await Promise.all([
      fetchActivityRows(),
      loadJusticeDataset()
    ])
    rows.value = activityRows
    dataset.value = loadedDataset
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <JusticeSection
    title="Combien d’affaires civiles arrivent devant les tribunaux ?"
    description="Loyers impayés, séparations, tutelles, conflits de voisinage… Chaque année, des milliers de litiges du quotidien sont portés devant les tribunaux judiciaires. Découvrez leur nombre et le temps qu’il faut, en moyenne, pour les juger."
    :loading="loading"
    :error="error"
    :dataset="dataset"
  >
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-6 justice-col">
        <VizCard
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
      <div class="fr-col-12 fr-col-md-6 justice-col">
        <VizCard
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
