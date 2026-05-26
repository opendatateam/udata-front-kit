import type { Ref } from 'vue'
import type { IndicatorMesh, IndicatorResource } from '../../../model/indicator'
import { debug } from './debug'
import { DEFAULT_TABULAR_API_URL, GEOCOLUMNS, YEAR_COLUMN } from './enums'
import { formatData } from './format'
import type { IndicatorVizFormattedRow } from './types'

async function fetchAllPages(url: string): Promise<Record<string, unknown>[]> {
  const urlObj = new URL(url)
  if (!urlObj.searchParams.has('page_size')) {
    urlObj.searchParams.set('page_size', '200')
  }

  const response = await fetch(urlObj.toString())
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Erreur HTTP ${response.status}`)
  }

  const body = await response.json()
  const data: Record<string, unknown>[] = body.data ?? []
  const nextUrl: string | null = body.links?.next ?? null

  if (nextUrl && data.length > 0) {
    const nextData = await fetchAllPages(nextUrl)
    return data.concat(nextData)
  }

  return data
}

const fetchCache = new Map<string, IndicatorVizFormattedRow[]>()

export function useTabularData(
  tabularApiUrl: Ref<string>,
  resources: Ref<IndicatorResource[]>,
  selectedIndicatorVizMesh: Ref<IndicatorMesh>,
  selectedTerritory: Ref<string>
) {
  const rawData = ref<IndicatorVizFormattedRow[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const availableAxisValues = computed<Record<string, string[]>>(() => {
    const resource = resources.value.find(
      (r) =>
        r.extras['ecospheres-indicateurs']?.maille ===
        selectedIndicatorVizMesh.value
    )
    if (!resource || rawData.value.length === 0) return {}
    const axisKeys = Object.keys(
      resource.extras['ecospheres-indicateurs']?.axes ?? {}
    )
    return axisKeys.reduce<Record<string, string[]>>((acc, axis) => {
      acc[axis] = [
        ...new Set(rawData.value.map((row) => String(row[axis])))
      ].sort()
      return acc
    }, {})
  })

  async function fetchData() {
    const mesh = selectedIndicatorVizMesh.value
    const resource = resources.value.find(
      (r) => r.extras['ecospheres-indicateurs']?.maille === mesh
    )
    if (!resource) return

    if (mesh !== 'fr' && !selectedTerritory.value) return

    isLoading.value = true
    error.value = null

    const geoCondition =
      mesh !== 'fr'
        ? `${GEOCOLUMNS[mesh]}__exact=${selectedTerritory.value}&`
        : ''

    const baseUrl = tabularApiUrl.value || DEFAULT_TABULAR_API_URL
    const url = `${baseUrl}/api/resources/${resource.id}/data/?${geoCondition}${YEAR_COLUMN}__sort=asc`

    debug.log(`🔄 Fetching data for resource ${resource.id}`, { mesh, url })

    try {
      if (fetchCache.has(url)) {
        rawData.value = fetchCache.get(url)!
        debug.log(`✅ Data from cache: ${rawData.value.length} records`)
        return
      }
      const allData = await fetchAllPages(url)
      const formatted = formatData(allData, resource)
      fetchCache.set(url, formatted)
      rawData.value = formatted
      debug.log(`✅ Data fetched: ${formatted.length} records`)
    } catch (err) {
      debug.error('Failed to fetch data', err)
      error.value = err instanceof Error ? err.message : String(err)
      rawData.value = []
    } finally {
      isLoading.value = false
    }
  }

  watch([selectedIndicatorVizMesh, selectedTerritory], () => fetchData(), {
    immediate: true
  })

  return { rawData, availableAxisValues, isLoading, error }
}
