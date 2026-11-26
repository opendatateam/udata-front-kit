import config from '@/config'

export type TabularRow = {
  __id: number
  categories: string
} & Record<string, string | number | null>

type TabularResponse = {
  data: TabularRow[]
}

export async function fetchResourceRows(
  resourceId: string
): Promise<TabularRow[]> {
  const url = `${config.datagouvfr.tabular_api_url}/api/resources/${resourceId}/data/?page_size=100`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Tabular API ${response.status}`)
  }
  const body = (await response.json()) as TabularResponse
  return body.data
}

export function yearColumns(rows: TabularRow[]): number[] {
  const years = new Set<number>()
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (/^\d{4}$/.test(key)) years.add(Number(key))
    }
  }
  return [...years].sort((a, b) => a - b)
}

export function latestYear(rows: TabularRow[]): number | null {
  const years = yearColumns(rows)
  return years.length ? years[years.length - 1] : null
}

function normalizeLabel(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/[’']/g, "'")
    .trim()
}

export function findRow(
  rows: TabularRow[],
  category: string
): TabularRow | undefined {
  const target = normalizeLabel(category)
  return rows.find((row) => normalizeLabel(row.categories) === target)
}

export function asNumber(
  raw: string | number | null | undefined
): number | null {
  if (raw == null || raw === '' || raw === 'nc') return null
  const parsed = Number(String(raw).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

export function cellNumber(
  row: TabularRow | undefined,
  year: number
): number | null {
  if (!row) return null
  return asNumber(row[String(year)])
}
