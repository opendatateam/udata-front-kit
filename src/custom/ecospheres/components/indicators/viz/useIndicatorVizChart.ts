import Chart, { type ChartConfiguration } from 'chart.js/auto'
import type { Ref } from 'vue'
import type { IndicatorExtrasData } from '../../../model/indicator'
import { debug } from './debug'
import { COLORS } from './enums'
import { formatBigNumber, formatNumber } from './format'
import type { IndicatorVizChartSeries } from './types'

function getMinMaxYear(years: number[]): [number, number] {
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)
  if (maxYear === minYear) {
    return [minYear - 1, minYear + 1]
  }
  return [minYear, maxYear]
}

function buildConfig(
  series: IndicatorVizChartSeries[],
  extras: IndicatorExtrasData,
  chartTitle: string
): ChartConfiguration {
  const maxValue = Math.max(...series.flatMap((s) => s.data.map((p) => p.y)))
  const years = series.flatMap((s) => s.data.map((p) => p.x))
  const [minYear, maxYear] = getMinMaxYear(years)

  return {
    type: series.every((s) => s.data.length <= 1) ? 'bar' : 'line',
    data: { datasets: series },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 15 } },
      interaction: { intersect: false, mode: 'x' },
      plugins: {
        title: {
          display: !!chartTitle,
          text: chartTitle,
          font: { family: 'Marianne, arial, sans-serif' }
        },
        legend: {
          display: series.length > 1,
          labels: { boxWidth: 16, boxHeight: 16 },
          onClick: () => {}
        },
        tooltip: {
          bodySpacing: 4,
          displayColors: series.length > 1,
          callbacks: {
            title: (items) =>
              (items[0].raw as { x: number; y: number }).x.toString(),
            label: (item) => {
              const raw = item.raw as { x: number; y: number }
              const prefix = series.length > 1 ? item.dataset.label + ' : ' : ''
              return `${prefix}${formatNumber(raw.y)} ${extras.unite}`
            }
          },
          itemSort: (i, j) =>
            (j.raw as { x: number; y: number }).y -
            (i.raw as { x: number; y: number }).y
        }
      },
      scales: {
        x: {
          type: 'linear',
          suggestedMax: maxYear,
          suggestedMin: minYear,
          ticks: {
            stepSize: 1,
            callback: (val) => (Number.isInteger(val) ? val.toString() : '')
          }
        },
        y: {
          title: { display: true, text: extras.unite },
          beginAtZero: extras.y_start_at_zero ?? false,
          ticks: {
            callback: (val) =>
              extras.ignore_format_big_number
                ? formatNumber(val as number)
                : formatBigNumber(val as number, maxValue)
          }
        }
      }
    }
  }
}

function applyColors(
  series: IndicatorVizChartSeries[]
): IndicatorVizChartSeries[] {
  series.forEach((s, idx) => {
    s.borderColor = COLORS[idx % COLORS.length]
    s.backgroundColor = COLORS[idx % COLORS.length]
  })
  return series
}

export function useIndicatorVizChart(
  canvasRef: Ref<HTMLCanvasElement | null>,
  series: Ref<IndicatorVizChartSeries[]>,
  extras: Ref<IndicatorExtrasData>,
  chartTitle: Ref<string>
) {
  let chartInstance: Chart | null = null
  let currentType: 'bar' | 'line' | null = null
  let currentIsMultiSeries: boolean | null = null

  function destroyChart() {
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
      currentType = null
      currentIsMultiSeries = null
    }
  }

  function createOrUpdateChart(newSeries: IndicatorVizChartSeries[]) {
    const hasNoData =
      newSeries.length === 0 || newSeries.every((s) => s.data.length === 0)
    if (!canvasRef.value || hasNoData) {
      if (hasNoData) debug.warn('No data to display')
      return
    }
    debug.log(`⚙️ Computing chart`, { datasetsCount: newSeries.length })

    const colored = applyColors(newSeries.map((s) => ({ ...s })))

    const newType = colored.every((s) => s.data.length <= 1) ? 'bar' : 'line'
    const newIsMultiSeries = colored.length > 1

    if (
      chartInstance &&
      currentType === newType &&
      currentIsMultiSeries === newIsMultiSeries
    ) {
      chartInstance.data.datasets = colored
      chartInstance.update()
    } else {
      destroyChart()
      currentType = newType
      currentIsMultiSeries = newIsMultiSeries
      chartInstance = new Chart(
        canvasRef.value,
        buildConfig(colored, extras.value, chartTitle.value)
      )
    }
  }

  // flush: 'post' ensures the canvas is in the DOM before we try to draw on it
  watch(series, (newSeries) => createOrUpdateChart(newSeries), {
    flush: 'post'
  })
  watch(canvasRef, (canvas) => {
    if (!canvas) destroyChart()
  })

  onBeforeUnmount(destroyChart)
}
