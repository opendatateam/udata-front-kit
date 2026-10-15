<script lang="ts" setup>
import Chart, { type ChartConfiguration } from 'chart.js/auto'
import { onMounted, onUnmounted, ref, watch } from 'vue'

import {
  decimalFormat,
  FONT,
  integerFormat,
  PIE_COLORS,
  type PieSlice
} from '@/custom/justice/utils/chartTheme'

const props = withDefaults(
  defineProps<{
    slices: PieSlice[]
    ariaLabel: string
    height?: number
    colors?: string[]
  }>(),
  {
    height: 460,
    colors: () => PIE_COLORS
  }
)

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function render() {
  if (!canvas.value || props.slices.length === 0) return
  chart?.destroy()
  const config: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: props.slices.map((slice) => slice.label),
      datasets: [
        {
          data: props.slices.map((slice) => slice.value),
          backgroundColor: props.colors
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            font: { family: FONT }
          }
        },
        tooltip: {
          callbacks: {
            label: (item) => {
              const value = Number(item.raw)
              const total = (item.dataset.data as number[]).reduce(
                (sum, current) => sum + current,
                0
              )
              const share = total ? (value / total) * 100 : 0
              return ` ${item.label} : ${integerFormat.format(value)} (${decimalFormat.format(share)} %)`
            }
          }
        }
      }
    }
  }
  chart = new Chart(canvas.value, config)
}

watch(
  () => props.slices,
  () => render(),
  { deep: true }
)

onMounted(render)

onUnmounted(() => chart?.destroy())
</script>

<template>
  <div class="chart-box" :style="{ height: `${height}px` }">
    <canvas ref="canvas" role="img" :aria-label="ariaLabel" />
  </div>
</template>

<style scoped>
.chart-box {
  position: relative;
}
</style>
