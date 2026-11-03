<script lang="ts" setup>
import Chart, { type ChartConfiguration } from 'chart.js/auto'
import { onMounted, onUnmounted, ref, watch } from 'vue'

import {
  compactFormat,
  FONT,
  integerFormat,
  monthFormat,
  type ChartSeries
} from '@/custom/justice/utils/chartTheme'

const props = withDefaults(
  defineProps<{
    labels: string[]
    series: ChartSeries[]
    yTitle: string
    accessibleLabel: string
    height?: number
    stacked?: boolean
    valueFormat?: 'integer' | 'month'
    xEvery?: number
    stackTotal?: boolean
  }>(),
  {
    height: 360,
    stacked: false,
    valueFormat: 'integer',
    xEvery: 0,
    stackTotal: false
  }
)

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function formatValue(value: number): string {
  return props.valueFormat === 'month'
    ? `${monthFormat.format(value)} mois`
    : integerFormat.format(value)
}

function render() {
  if (!canvas.value || props.labels.length === 0 || props.series.length === 0) {
    return
  }
  const mixed =
    props.series.some((item) => item.kind === 'line') &&
    props.series.some((item) => (item.kind ?? 'bar') === 'bar')
  chart?.destroy()
  const config: ChartConfiguration = {
    type: props.series.every((item) => item.kind === 'line') ? 'line' : 'bar',
    data: {
      labels: props.labels,
      datasets: props.series.map((item) =>
        item.kind === 'line'
          ? {
              type: 'line' as const,
              label: item.label,
              data: item.data,
              borderColor: item.color,
              backgroundColor: item.color,
              tension: 0.2,
              order: mixed ? 1 : 0,
              ...(item.markers
                ? {
                    pointBackgroundColor: '#fff',
                    pointBorderColor: item.color,
                    pointBorderWidth: 2
                  }
                : {})
            }
          : {
              type: 'bar' as const,
              label: item.label,
              data: item.data,
              backgroundColor: item.fill ?? item.color,
              borderColor: item.color,
              borderWidth: item.fill && item.fill !== item.color ? 1 : 0,
              stack: props.stacked ? (item.stack ?? 'values') : undefined,
              order: mixed ? 2 : 0
            }
      )
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            font: { family: FONT },
            sort: (a, b) => (a.datasetIndex ?? 0) - (b.datasetIndex ?? 0)
          }
        },
        tooltip: {
          callbacks: {
            label: (item) => {
              if (item.raw == null)
                return `${item.dataset.label} : non renseigné`
              return `${item.dataset.label} : ${formatValue(Number(item.raw))}`
            },
            footer: props.stackTotal
              ? (items) => {
                  if (items.some((item) => item.raw == null)) {
                    return 'Total incomplet : une série n’est pas renseignée'
                  }
                  const sum = items.reduce(
                    (total, item) => total + Number(item.raw),
                    0
                  )
                  return `Total : ${integerFormat.format(sum)}`
                }
              : undefined
          }
        }
      },
      scales: {
        x: {
          stacked: props.stacked,
          ticks: {
            autoSkip: props.xEvery === 0,
            maxRotation: 0,
            font: { family: FONT },
            callback(value) {
              const label = this.getLabelForValue(Number(value))
              if (!props.xEvery) return label
              return Number(label) % props.xEvery === 0 ? label : ''
            }
          }
        },
        y: {
          stacked: props.stacked,
          beginAtZero: true,
          title: {
            display: true,
            text: props.yTitle,
            font: { family: FONT }
          },
          ticks: {
            font: { family: FONT },
            callback: (value) =>
              props.valueFormat === 'month'
                ? monthFormat.format(Number(value))
                : compactFormat.format(Number(value))
          }
        }
      }
    }
  }
  chart = new Chart(canvas.value, config)
}

watch(
  () => props.series,
  () => render(),
  { deep: true }
)

onMounted(render)

onUnmounted(() => chart?.destroy())
</script>

<template>
  <div class="chart-box" :style="{ height: `${height}px` }">
    <canvas ref="canvas" role="img" :aria-label="accessibleLabel" />
  </div>
</template>

<style scoped>
.chart-box {
  position: relative;
}
</style>
