<script lang="ts" setup>
import { decimalFormat, integerFormat } from '@/custom/justice/utils/chartTheme'
import { cellNumber, type TabularRow } from '@/custom/justice/utils/tabular'

defineProps<{
  rows: TabularRow[]
  years: number[]
  caption: string
}>()

function formatCell(row: TabularRow, year: number): string {
  const raw = row[String(year)]
  if (raw == null || raw === '') return '—'
  if (raw === 'nc') return 'n.c.'
  const value = cellNumber(row, year)
  if (value == null) return String(raw)
  const rounded = Math.round(value)
  return rounded === value
    ? integerFormat.format(value)
    : decimalFormat.format(value)
}
</script>

<template>
  <div class="justice-table-scroll">
    <table class="justice-table">
      <caption class="fr-sr-only">
        {{
          caption
        }}
      </caption>
      <thead>
        <tr>
          <th scope="col">Catégorie</th>
          <th v-for="year in years" :key="year" scope="col" class="number">
            {{ year }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.__id">
          <th scope="row">{{ row.categories }}</th>
          <td v-for="year in years" :key="year" class="number">
            {{ formatCell(row, year) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
