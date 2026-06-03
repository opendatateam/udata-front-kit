import type { IndicatorResource } from '../../../model/indicator'
import { YEAR_COLUMN } from './enums'
import type { IndicatorVizFormattedRow } from './types'

export function formatNumber(x: number): string {
  return new Intl.NumberFormat().format(x)
}

export function formatBigNumber(
  value: number,
  maxValue = value,
  nbDecimals = 1
): string {
  const n = Number(value)
  const max = Number(maxValue)
  if (max < 1000) {
    return formatNumber(Number(n.toFixed(nbDecimals)))
  }

  let suffix = ''
  let divisor = 1

  if (max >= 1_000_000_000) {
    suffix = 'Md'
    divisor = 1_000_000_000
  } else if (max >= 1_000_000) {
    suffix = 'M'
    divisor = 1_000_000
  } else {
    suffix = 'k'
    divisor = 1000
  }

  const scaled = n / divisor
  const formatted = Number.isInteger(scaled)
    ? formatNumber(scaled)
    : formatNumber(Number(scaled.toFixed(nbDecimals)))

  return `${formatted}${suffix}`
}

function formatValue(value: number): number {
  const n = Number(value)
  if (n < 10 && !Number.isInteger(n)) {
    return parseFloat(n.toFixed(2))
  }
  return Math.round(n)
}

export function formatData(
  data: Record<string, unknown>[],
  resource: IndicatorResource
): IndicatorVizFormattedRow[] {
  if (!data || data.length === 0) {
    return []
  }
  const resourceExtras = resource.extras['ecospheres-indicateurs']!
  const axisNames = Object.keys(resourceExtras.axes ?? {})
  const valueColumn = resourceExtras['value-column'] ?? ''
  return data.map((d) => {
    const value = d[valueColumn]
    if (value == null) {
      throw new Error(
        `No value found for column ${valueColumn} in ${resource.id}`
      )
    }
    const row: IndicatorVizFormattedRow = {
      year: new Date(d[YEAR_COLUMN] as string).getFullYear(),
      value: formatValue(value as number)
    }
    axisNames.forEach((axis) => {
      row[axis] = d[axis] as string | number
    })
    return row
  })
}
