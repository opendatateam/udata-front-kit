<script lang="ts" setup>
import type { DatasetV2WithFullObject } from '@datagouv/components-next'
import { computed, onMounted, ref } from 'vue'

import ChoroplethMap from '@/custom/justice/components/ChoroplethMap.vue'
import JusticeSection from '@/custom/justice/components/JusticeSection.vue'
import TimeSeriesChart from '@/custom/justice/components/TimeSeriesChart.vue'
import VizCard from '@/custom/justice/components/VizCard.vue'
import {
  BLUE,
  integerFormat,
  PURPLE,
  type ChartSeries
} from '@/custom/justice/utils/chartTheme'
import { loadJusticeDataset } from '@/custom/justice/utils/dataset'
import {
  fetchResourceGeoJson,
  type MapFeature
} from '@/custom/justice/utils/geojson'
import {
  asNumber,
  fetchResourceRows,
  type TabularRow
} from '@/custom/justice/utils/tabular'

const SERIES_RESOURCE = '8ddb7039-ebf2-4366-b8a7-909ae1fedc09'
const TERRITORY_RESOURCE = '9f6e4624-a94c-4a1e-bd95-3bec14ae5033'
const GEOJSON_RESOURCE = 'c6edcdac-1148-40d8-9f73-c5bb607940c3'

const METRICS = [
  { id: 'personnes_ecrouees', label: 'Personnes écrouées' },
  { id: 'dont_personnes_detenues', label: 'Personnes détenues' },
  {
    id: 'personnes_suivies_en_milieu_ouvert',
    label: 'Personnes en milieu ouvert'
  },
  { id: 'total', label: 'Total' }
]

const series = ref<TabularRow[]>([])
const territories = ref<MapFeature[]>([])
const dataset = ref<DatasetV2WithFullObject | null>(null)
const error = ref(false)
const loading = ref(true)

const yearLabels = computed(() =>
  series.value.map((row) => String(row.date).slice(0, 4))
)

const custodySeries = computed<ChartSeries[]>(() => [
  {
    label: 'Personnes écrouées',
    color: BLUE,
    data: series.value.map((row) => asNumber(row.personnes_ecrouees))
  },
  {
    label: 'Personnes en milieu ouvert',
    color: PURPLE,
    data: series.value.map((row) =>
      asNumber(row.personnes_suivies_en_milieu_ouvert)
    )
  }
])

const headline = computed(() => {
  const latest = [...series.value]
    .reverse()
    .find((row) => asNumber(row.total) != null)
  const total = latest ? asNumber(latest.total) : null
  if (!latest || total == null) return 'Écrou et milieu ouvert'
  return `${integerFormat.format(total)} personnes en ${String(latest.date).slice(0, 4)}`
})

function joinTerritories(features: MapFeature[], rows: TabularRow[]) {
  const byDisp = new Map<string, TabularRow>()
  for (const row of rows) {
    const disp = String(row.disp ?? '').trim()
    if (!disp || disp.toLowerCase() === 'total') continue
    byDisp.set(disp, row)
  }
  return features.map((feature) => {
    const row = byDisp.get(String(feature.properties.nom_court ?? '').trim())
    return {
      ...feature,
      properties: {
        nom: String(feature.properties.nom ?? ''),
        nom_court: String(feature.properties.nom_court ?? ''),
        personnes_ecrouees: asNumber(row?.personnes_ecrouees),
        dont_personnes_detenues: asNumber(row?.dont_personnes_detenues),
        personnes_suivies_en_milieu_ouvert: asNumber(
          row?.personnes_suivies_en_milieu_ouvert
        ),
        total: asNumber(row?.total)
      }
    }
  })
}

onMounted(async () => {
  try {
    const [seriesRows, territoryRows, features, loadedDataset] =
      await Promise.all([
        fetchResourceRows(SERIES_RESOURCE),
        fetchResourceRows(TERRITORY_RESOURCE),
        fetchResourceGeoJson(GEOJSON_RESOURCE),
        loadJusticeDataset()
      ])
    series.value = [...seriesRows]
      .filter((row) => String(row.date).slice(0, 4) !== '2026')
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    territories.value = joinTerritories(features, territoryRows)
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
    title="Personnes placées sous la main de la justice"
    description="Personnes prises en charge par l’administration pénitentiaire : les personnes écrouées, dont une partie est détenue, et les personnes suivies en milieu ouvert."
    :loading="loading"
    :error="error"
    :dataset="dataset"
  >
    <VizCard
      :title="headline"
      source-id="sources-main-justice"
      source="Chaque barre additionne les personnes écrouées et les personnes suivies en milieu ouvert. Les personnes détenues font partie des personnes écrouées : elles ne sont pas empilées en plus. L’année 2026 n’est pas affichée : le milieu ouvert n’y est pas encore renseigné."
    >
      <TimeSeriesChart
        :labels="yearLabels"
        :series="custodySeries"
        stacked
        stack-total
        :x-every="5"
        y-title="Nombre de personnes"
        accessible-label="Histogramme empilé, année par année, des personnes écrouées et des personnes suivies en milieu ouvert"
        :height="420"
      />
    </VizCard>
    <VizCard
      class="fr-mt-4w"
      title="Répartition de la population pénitentiaire"
      source-id="sources-main-justice-carte"
      source="Chaque direction est colorée selon le nombre de personnes pour l’indicateur choisi. L’outre-mer est accessible par le bouton dédié."
    >
      <ChoroplethMap
        :features="territories"
        :metrics="METRICS"
        accessible-label="Carte des directions interrégionales des services pénitentiaires"
      />
    </VizCard>
  </JusticeSection>
</template>
