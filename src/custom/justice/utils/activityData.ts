import config from '@/config'

export const ACTIVITY_DATASET_SLUG = 'sample-donnees-test-j'
export const ACTIVITY_RESOURCE_ID = '43716f2b-ddbc-4e8d-8b4b-e867d98b9cca'

export const ACTIVITY_YEARS = [2020, 2021, 2022, 2023, 2024] as const

export type ActivityRow = {
  categories: string
} & Record<(typeof ACTIVITY_YEARS)[number], number | null>

type TabularResponse = {
  data: ActivityRow[]
}

export async function fetchActivityRows(): Promise<ActivityRow[]> {
  const url = `${config.datagouvfr.tabular_api_url}/api/resources/${ACTIVITY_RESOURCE_ID}/data/?page_size=50`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Tabular API ${response.status}`)
  }
  const body = (await response.json()) as TabularResponse
  return body.data
}

export function valuesFor(rows: ActivityRow[], category: string): number[] {
  const row = rows.find((item) => item.categories === category)
  if (!row) return []
  return ACTIVITY_YEARS.map((year) => Number(row[year] ?? 0))
}
