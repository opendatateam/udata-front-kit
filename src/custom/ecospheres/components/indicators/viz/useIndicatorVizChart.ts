import Chart, { type ChartConfiguration } from 'chart.js/auto'
import type { Ref } from 'vue'
import type { IndicatorExtrasData } from '../../../model/indicator'
import { debug } from './debug'
import { getSeriesColor } from './enums'
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

interface BuildConfigOptions {
  extras: IndicatorExtrasData
  chartTitle: string
  stacked: boolean
}

function buildConfig(
  series: IndicatorVizChartSeries[],
  { extras, chartTitle, stacked }: BuildConfigOptions
): ChartConfiguration {
  const maxValue = Math.max(...series.flatMap((s) => s.data.map((p) => p.y)))
  const years = series.flatMap((s) => s.data.map((p) => p.x))
  const [minYear, maxYear] = getMinMaxYear(years)
  const type = series.every((s) => s.data.length <= 1) ? 'bar' : 'line'
  const effectiveStacked = type === 'bar' ? false : stacked

  return {
    type,
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
          stacked: effectiveStacked,
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
  series: IndicatorVizChartSeries[],
  { stacked }: { stacked: boolean }
): IndicatorVizChartSeries[] {
  series.forEach((s, idx) => {
    s.borderColor = getSeriesColor(idx)
    s.backgroundColor = getSeriesColor(idx)
    // Turns the line into a stacked area (paired with y.stacked in buildConfig).
    s.fill = stacked
  })
  return series
}

interface UseIndicatorVizChartOptions {
  canvasRef: Ref<HTMLCanvasElement | null>
  series: Ref<IndicatorVizChartSeries[]>
  extras: Ref<IndicatorExtrasData>
  chartTitle: Ref<string>
  stacked: Ref<boolean>
}

export function useIndicatorVizChart({
  canvasRef,
  series,
  extras,
  chartTitle,
  stacked
}: UseIndicatorVizChartOptions) {
  let chartInstance: Chart | null = null
  let currentType: 'bar' | 'line' | null = null
  let currentIsMultiSeries: boolean | null = null
  let currentStacked: boolean | null = null
  const hasNoData = ref(false)

  function destroyChart() {
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
      currentType = null
      currentIsMultiSeries = null
      currentStacked = null
    }
  }

  function createOrUpdateChart(newSeries: IndicatorVizChartSeries[]) {
    const noData =
      newSeries.length === 0 || newSeries.every((s) => s.data.length === 0)
    hasNoData.value = noData
    if (!canvasRef.value || noData) {
      if (noData) debug.warn('No data to display')
      return
    }
    debug.log(`⚙️ Computing chart`, { datasetsCount: newSeries.length })

    const colored = applyColors(
      newSeries.map((s) => ({ ...s })),
      {
        stacked: stacked.value
      }
    )

    const newType = colored.every((s) => s.data.length <= 1) ? 'bar' : 'line'
    const newIsMultiSeries = colored.length > 1

    if (
      chartInstance &&
      currentType === newType &&
      currentIsMultiSeries === newIsMultiSeries &&
      currentStacked === stacked.value
    ) {
      chartInstance.data.datasets = colored
      chartInstance.update()
    } else {
      destroyChart()
      currentType = newType
      currentIsMultiSeries = newIsMultiSeries
      currentStacked = stacked.value
      chartInstance = new Chart(
        canvasRef.value,
        buildConfig(colored, {
          extras: extras.value,
          chartTitle: chartTitle.value,
          stacked: stacked.value
        })
      )
    }
  }

  // flush: 'post' ensures the canvas is in the DOM before we try to draw on it
  watch(series, (newSeries) => createOrUpdateChart(newSeries), {
    flush: 'post'
  })
  watch(canvasRef, (canvas) => {
    if (!canvas) destroyChart()
    else createOrUpdateChart(series.value)
  })

  onBeforeUnmount(destroyChart)

  return { hasNoData }
}
