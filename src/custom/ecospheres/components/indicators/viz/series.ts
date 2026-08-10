import { debug } from './debug'
import type { IndicatorVizChartSeries, IndicatorVizFormattedRow } from './types'

function groupDataByYear(
  items: IndicatorVizFormattedRow[]
): { x: number; y: number }[] {
  const grouped = items.reduce<Record<number, number>>((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = 0
    }
    acc[item.year] += item.value as number
    return acc
  }, {})
  return Object.entries(grouped).map(([year, value]) => ({
    x: Number(year),
    y: value
  }))
}

function filterDataByAxis(
  data: IndicatorVizFormattedRow[],
  axisNames: string[],
  axisFilters: Record<string, string[]>
): IndicatorVizFormattedRow[] {
  return data.filter((d) =>
    axisNames.every((axis) => {
      const values = axisFilters[axis] ?? []
      return values.map(String).includes(String(d[axis]))
    })
  )
}

function splitDataByAxis(
  data: IndicatorVizFormattedRow[],
  axisNames: string[],
  groupedAxis: Record<string, boolean>
): IndicatorVizChartSeries[] {
  const groupedAxisNames = axisNames.filter((axis) => groupedAxis[axis])
  const nonGroupedAxisNames = axisNames.filter((axis) => !groupedAxis[axis])

  const groupsMap = new Map<string, IndicatorVizFormattedRow[]>()

  for (const item of data) {
    const key =
      nonGroupedAxisNames.map((axis) => item[axis]).join(' - ') || 'Total'
    if (!groupsMap.has(key)) {
      groupsMap.set(key, [])
    }
    groupsMap.get(key)!.push(item)
  }

  return Array.from(groupsMap.entries()).map(([key, items]) => {
    const chartData =
      groupedAxisNames.length > 0
        ? groupDataByYear(items)
        : items.map((item) => ({ x: item.year, y: item.value as number }))

    return { label: key, data: chartData }
  })
}

export function makeSeries(
  rawData: IndicatorVizFormattedRow[],
  axisNames: string[],
  axisFilters: Record<string, string[]>,
  groupedAxis: Record<string, boolean>
): IndicatorVizChartSeries[] {
  if (axisNames.length === 0) {
    return [
      {
        label: '',
        data: rawData.map((d) => ({ x: d.year, y: d.value as number }))
      }
    ]
  }

  const filtered = filterDataByAxis(rawData, axisNames, axisFilters)
  debug.log(`⚙️ Data filtered: ${rawData.length} → ${filtered.length} items`)
  return splitDataByAxis(filtered, axisNames, groupedAxis)
}
