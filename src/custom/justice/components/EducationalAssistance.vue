<script lang="ts" setup>
import type { DatasetV2 } from '@datagouv/components-next'
import { computed, onMounted, ref } from 'vue'

import JusticeSection from '@/custom/justice/components/JusticeSection.vue'
import PieChart from '@/custom/justice/components/PieChart.vue'
import TimeSeriesChart from '@/custom/justice/components/TimeSeriesChart.vue'
import VizCard from '@/custom/justice/components/VizCard.vue'
import {
  BAR_PALE,
  BLUE,
  integerFormat,
  ORANGE,
  PIE_COLORS,
  PURPLE,
  RED,
  TEAL,
  type ChartSeries,
  type PieSlice
} from '@/custom/justice/utils/chartTheme'
import { loadJusticeDataset } from '@/custom/justice/utils/dataset'
import {
  cellNumber,
  fetchResourceRows,
  findRow,
  latestYear,
  yearColumns,
  type TabularRow
} from '@/custom/justice/utils/tabular'

const RESOURCE_ID = '3c7cd710-4ebc-41f4-a957-c6fba6d45c66'
const AGE_RESOURCE_ID = '8ef7c510-666b-4f33-ae0a-8c98f4ea9920'

const AGE_CLASSES = [
  { key: '0-6_ans', label: '0 à 6 ans', color: BLUE },
  { key: '7-12_ans', label: '7 à 12 ans', color: PURPLE },
  { key: '13-15_ans', label: '13 à 15 ans', color: TEAL },
  { key: '16-17_ans', label: '16 à 17 ans', color: ORANGE }
] as const

const TOTAL = 'toutes_saisines'
const PARQUET = 'saisines_parquet'
const OFFICE = 'saisines_d_office'
const MINEUR = 'saisines_par_le_mineur_ou_un_proche'
const PIE_EXCLUDED = new Set([TOTAL, PARQUET, OFFICE])

const LABELS: Record<string, string> = {
  [TOTAL]: 'Toutes les saisines',
  [PARQUET]: 'Saisines du parquet',
  [OFFICE]: 'Saisines d’office',
  [MINEUR]: 'Saisines par le mineur ou un proche',
  saisines_parquet_aide_sociale_a_l_enfance:
    'Parquet — aide sociale à l’enfance',
  saisines_parquet_police_gendarmerie: 'Parquet — police et gendarmerie',
  saisines_parquet_education_nationale: 'Parquet — éducation nationale',
  saisines_parquet_milieu_medical: 'Parquet — milieu médical',
  saisines_parquet_origine_autre_ou_inconnue:
    'Parquet — origine autre ou inconnue',
  saisines_d_office_aide_sociale_a_l_enfance:
    'D’office — aide sociale à l’enfance',
  saisines_d_office_origine_autre_ou_inconnue:
    'D’office — origine autre ou inconnue'
}

const rows = ref<TabularRow[]>([])
const ageRows = ref<TabularRow[]>([])
const dataset = ref<DatasetV2 | null>(null)
const error = ref(false)
const loading = ref(true)

const years = computed(() => yearColumns(rows.value))
const latest = computed(() => latestYear(rows.value))
const ageYears = computed(() => yearColumns(ageRows.value))
const ageLatest = computed(() => latestYear(ageRows.value))
const yearLabels = computed(() => years.value.map(String))
const ageLabels = computed(() => ageYears.value.map(String))

const headline = computed(() => {
  const year = latest.value
  const total = valueFor(TOTAL, year)
  if (year == null || total == null) return 'Les saisines par année'
  return `${integerFormat.format(total)} saisines en ${year}`
})

const pieTitle = computed(() =>
  latest.value == null
    ? 'Le détail des origines'
    : `Le détail des origines en ${latest.value}`
)

const boysTitle = computed(() => ageTitle('total_garcons', 'garçons'))
const girlsTitle = computed(() => ageTitle('total_filles', 'filles'))

const originSeries = computed<ChartSeries[]>(() => [
  {
    label: displayLabel(TOTAL),
    color: BLUE,
    fill: BAR_PALE,
    data: series(TOTAL)
  },
  {
    label: displayLabel(PARQUET),
    color: BLUE,
    kind: 'line',
    markers: true,
    data: series(PARQUET)
  },
  {
    label: displayLabel(OFFICE),
    color: RED,
    kind: 'line',
    markers: true,
    data: series(OFFICE)
  },
  {
    label: displayLabel(MINEUR),
    color: PURPLE,
    kind: 'line',
    markers: true,
    data: series(MINEUR)
  }
])

const detailSlices = computed<PieSlice[]>(() => {
  const year = latest.value
  if (year == null) return []
  return rows.value
    .filter((row) => !PIE_EXCLUDED.has(row.categories))
    .map((row) => ({
      label: displayLabel(row.categories),
      value: cellNumber(row, year) ?? 0
    }))
    .filter((slice) => slice.value > 0)
})

const boysSeries = computed(() => ageSeries('garcons'))
const girlsSeries = computed(() => ageSeries('filles'))

function ageTitle(category: string, noun: string): string {
  const year = ageLatest.value
  const total = cellNumber(findRow(ageRows.value, category), year)
  if (year == null || total == null) return `Les ${noun} selon l’âge`
  return `${integerFormat.format(total)} saisines concernant des ${noun} en ${year}`
}

function displayLabel(category: string): string {
  return LABELS[category] ?? category.replaceAll('_', ' ')
}

function valueFor(category: string, year: number | null): number | null {
  if (year == null) return null
  return cellNumber(findRow(rows.value, category), year)
}

function series(category: string): number[] {
  return years.value.map((year) => valueFor(category, year) ?? 0)
}

function ageSeries(prefix: 'garcons' | 'filles'): ChartSeries[] {
  return AGE_CLASSES.map((age) => ({
    label: age.label,
    color: age.color,
    data: ageYears.value.map(
      (year) =>
        cellNumber(findRow(ageRows.value, `${prefix}_${age.key}`), year) ?? 0
    )
  }))
}

onMounted(async () => {
  try {
    const [resourceRows, ageResourceRows, loadedDataset] = await Promise.all([
      fetchResourceRows(RESOURCE_ID),
      fetchResourceRows(AGE_RESOURCE_ID),
      loadJusticeDataset()
    ])
    rows.value = resourceRows
    ageRows.value = ageResourceRows
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
    title="Saisine du juge des enfants en assistance éducative"
    description="Les saisines du juge des enfants en assistance éducative selon leur origine, et les effectifs de garçons et de filles par classe d’âge."
    error-label="Les graphiques n’ont pas pu être chargés."
    :loading="loading"
    :error="error"
    :dataset="dataset"
  >
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-6 justice-col">
        <VizCard
          :title="headline"
          source-id="sources-saisines"
          source="Chaque barre est le total des saisines de l’année. Les courbes distinguent les trois origines qui le composent : le parquet, la saisine d’office du juge, et le mineur ou un proche."
        >
          <TimeSeriesChart
            :labels="yearLabels"
            :series="originSeries"
            y-title="Nombre de saisines"
            aria-label="Histogramme du total des saisines par année, avec les courbes des saisines du parquet, d’office et par le mineur ou un proche"
            :height="460"
          />
        </VizCard>
      </div>
      <div class="fr-col-12 fr-col-md-6 justice-col">
        <VizCard
          :title="pieTitle"
          source-id="sources-saisines-detail"
          :source="`Répartition des saisines en ${latest ?? ''} selon l’origine détaillée. Les lignes « toutes les saisines », « saisines du parquet » et « saisines d’office » ne figurent pas : elles additionnent les autres catégories.`"
        >
          <PieChart
            :slices="detailSlices"
            :colors="PIE_COLORS"
            :aria-label="`Répartition des saisines en ${latest ?? ''} selon l’origine détaillée, hors totaux`"
          />
        </VizCard>
      </div>
    </div>
    <div
      v-if="ageRows.length"
      class="fr-grid-row fr-grid-row--gutters fr-mt-4w"
    >
      <div class="fr-col-12 fr-col-md-6 justice-col">
        <VizCard
          :title="boysTitle"
          source-id="sources-garcons"
          source="Effectifs de garçons, empilés par classe d’âge pour chaque année. Les totaux ne sont pas repris : ils additionnent les classes."
        >
          <TimeSeriesChart
            :labels="ageLabels"
            :series="boysSeries"
            stacked
            y-title="Effectif"
            aria-label="Histogramme empilé des garçons par classe d’âge et par année"
            :height="360"
          />
        </VizCard>
      </div>
      <div class="fr-col-12 fr-col-md-6 justice-col">
        <VizCard
          :title="girlsTitle"
          source-id="sources-filles"
          source="Même lecture pour les filles : effectifs empilés par classe d’âge, sans les lignes de total."
        >
          <TimeSeriesChart
            :labels="ageLabels"
            :series="girlsSeries"
            stacked
            y-title="Effectif"
            aria-label="Histogramme empilé des filles par classe d’âge et par année"
            :height="360"
          />
        </VizCard>
      </div>
    </div>
  </JusticeSection>
</template>
