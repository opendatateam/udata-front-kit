<script lang="ts" setup>
import type { DatasetV2WithFullObject } from '@datagouv/components-next'
import { onMounted, ref } from 'vue'

import JusticeSection from '@/custom/justice/components/JusticeSection.vue'
import PieChart from '@/custom/justice/components/PieChart.vue'
import ResourceTable from '@/custom/justice/components/ResourceTable.vue'
import VizCard from '@/custom/justice/components/VizCard.vue'
import { integerFormat, type PieSlice } from '@/custom/justice/utils/chartTheme'
import { loadJusticeDataset } from '@/custom/justice/utils/dataset'
import {
  cellNumber,
  fetchResourceRows,
  findRow,
  latestYear,
  yearColumns,
  type TabularRow
} from '@/custom/justice/utils/tabular'

const TRAITEES_RESOURCE = '6a8c4345-d723-4428-b67f-33c94d214b6d'
const CLASSEES_RESOURCE = '288def34-d190-4f94-9e2e-c797ca0590e7'
const POURSUITES_RESOURCE = 'e04718ae-0fb2-4692-a4f6-6463c590062d'
const VICTIMES_RESOURCE = '32705eef-b22f-4a97-b0f8-5352944b3d23'
const JUGEES_RESOURCE = '50a52322-d39a-426d-9df6-8368c195d012'

const CLASSEES_ROWS = [
  'CSS pour infraction non poursuivable',
  "CSS pour défaut d'élucidation (1)",
  'CSS pour inopportunité des poursuites'
] as const

type Indicator = {
  id: string
  label: string
  explanation: string
  value: number | null
  year: number | null
  rows: TabularRow[]
  years: number[]
}

const loading = ref(true)
const error = ref(false)
const dataset = ref<DatasetV2WithFullObject | null>(null)
const indicators = ref<Indicator[]>([])
const victimesSlices = ref<PieSlice[]>([])
const jugeesSlices = ref<PieSlice[]>([])

function pieSlices(rows: TabularRow[]): PieSlice[] {
  return rows
    .filter((row) => row.categories.trim().toLowerCase() !== 'total')
    .map((row) => ({
      label: row.categories,
      value: Number(row.victimes_effectifs)
    }))
    .filter((slice) => Number.isFinite(slice.value))
}

function buildIndicator(
  id: string,
  label: string,
  explanation: string,
  rows: TabularRow[],
  value: number | null
): Indicator {
  return {
    id,
    label,
    explanation,
    value,
    year: latestYear(rows),
    rows,
    years: yearColumns(rows)
  }
}

onMounted(async () => {
  try {
    const [traitees, classees, poursuites, victimes, jugees, loadedDataset] =
      await Promise.all([
        fetchResourceRows(TRAITEES_RESOURCE),
        fetchResourceRows(CLASSEES_RESOURCE),
        fetchResourceRows(POURSUITES_RESOURCE),
        fetchResourceRows(VICTIMES_RESOURCE),
        fetchResourceRows(JUGEES_RESOURCE),
        loadJusticeDataset()
      ])
    const traiteesYear = latestYear(traitees)
    const classeesYear = latestYear(classees)
    const poursuitesYear = latestYear(poursuites)
    const classeesValues =
      classeesYear == null
        ? null
        : CLASSEES_ROWS.map((label) =>
            cellNumber(findRow(classees, label), classeesYear)
          )
    const classeesSum = classeesValues?.every((value) => value != null)
      ? classeesValues.reduce((sum, value) => sum + value, 0)
      : null

    indicators.value = [
      buildIndicator(
        'traitees',
        'Affaires traitées',
        'Total des affaires pénales traitées par les parquets.',
        traitees,
        traiteesYear == null
          ? null
          : cellNumber(findRow(traitees, 'Affaires traitées'), traiteesYear)
      ),
      buildIndicator(
        'classees',
        'Affaires classées sans poursuites',
        'Addition des classements pour infraction non poursuivable, défaut d’élucidation et inopportunité des poursuites.',
        classees,
        classeesSum
      ),
      buildIndicator(
        'poursuivies',
        'Affaires pénales poursuivies',
        'Total des affaires pénales orientées vers une poursuite.',
        poursuites,
        poursuitesYear == null
          ? null
          : cellNumber(findRow(poursuites, 'Total'), poursuitesYear)
      )
    ]
    dataset.value = loadedDataset
    victimesSlices.value = pieSlices(victimes)
    jugeesSlices.value = pieSlices(jugees)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <JusticeSection
    title="Que devient une plainte pénale ?"
    description="La plupart des affaires pénales sont d’abord examinées par le parquet. Combien aboutissent à des poursuites, combien reçoivent une autre réponse, et pourquoi certaines sont-elles classées sans suite ? Plus des deux tiers des classements sans suite concernent des affaires dont l’auteur n’a pas été identifié. Quand une réponse est possible, elle est apportée dans 83 % des cas."
    loading-label="Préparation des indicateurs…"
    error-label="Les indicateurs n’ont pas pu être chargés."
    :loading="loading"
    :error="error"
    :dataset="dataset"
  >
    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="indicator in indicators"
        :key="indicator.id"
        class="fr-col-12 fr-col-md-4 justice-col"
      >
        <VizCard :source-id="`sources-${indicator.id}`">
          <p class="justice-figure">
            {{
              indicator.value == null
                ? '—'
                : integerFormat.format(indicator.value)
            }}
          </p>
          <h3 class="justice-stat-title">{{ indicator.label }}</h3>
          <p v-if="indicator.year" class="justice-year">
            En {{ indicator.year }}
          </p>
          <p>{{ indicator.explanation }}</p>
          <template #source>
            <ResourceTable
              :rows="indicator.rows"
              :years="indicator.years"
              :caption="`Détail de la ressource pour ${indicator.label}`"
            />
          </template>
        </VizCard>
      </div>
    </div>
    <div class="fr-grid-row fr-grid-row--gutters fr-mt-4w">
      <div class="fr-col-12 fr-col-md-6 justice-col">
        <VizCard
          title="Les victimes selon le type d’infraction traitées par le parquet"
          source-id="sources-victimes"
          source="Effectifs de victimes traitées selon la nature de l’affaire."
        >
          <PieChart
            :slices="victimesSlices"
            :height="420"
            accessible-label="Répartition des victimes selon le type d’infraction traitées par le parquet, hors total"
          />
        </VizCard>
      </div>
      <div class="fr-col-12 fr-col-md-6 justice-col">
        <VizCard
          title="Les victimes selon le type d’infraction devant le tribunal"
          source-id="sources-jugees"
          source="Effectifs de victimes jugées selon la nature de l’affaire."
        >
          <PieChart
            :slices="jugeesSlices"
            :height="420"
            accessible-label="Répartition des victimes selon le type d’infraction devant le tribunal, hors total"
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
