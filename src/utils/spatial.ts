import { ref, watch, type Ref } from 'vue'

import type { Topic } from '@/model'
import type { SpatialField, SpatialCoverage } from '@/model/spatial'
import SpatialAPI from '@/services/api/SpatialAPI'

export const getZoneFromSpatial = async (
  spatial: SpatialField | undefined | null
): Promise<SpatialCoverage | undefined> => {
  if (spatial == null) return
  const zoneId = spatial.zones != null ? spatial.zones[0] : undefined
  if (zoneId !== undefined) {
    const api = new SpatialAPI()
    return await api.getZone(zoneId)
  }
}

export function useSpatialCoverage(
  bouquet: Ref<Topic | null>
): Ref<SpatialCoverage | undefined> {
  const spatialCoverage = ref<SpatialCoverage | undefined>(undefined)

  watch(
    bouquet,
    async (newBouquet) => {
      if (newBouquet?.spatial != null) {
        const coverage = await getZoneFromSpatial(newBouquet.spatial)
        spatialCoverage.value = coverage
      } else {
        spatialCoverage.value = undefined
      }
    },
    { immediate: true }
  )

  return spatialCoverage
}

export function useSpatialCoverageFromField(
  spatialField: SpatialField | undefined | null
): Ref<SpatialCoverage | undefined> {
  const spatialCoverage = ref<SpatialCoverage | undefined>(undefined)

  if (spatialField != null) {
    getZoneFromSpatial(spatialField)
      .then((coverage) => {
        spatialCoverage.value = coverage
      })
      .catch((error) => {
        console.error('Failed to fetch coverage', error)
      })
  } else {
    spatialCoverage.value = undefined
  }

  return spatialCoverage
}
