import { ref, watch, type Ref } from 'vue'

import type { SpatialCoverage, SpatialField } from '@/model/spatial'
import type { Topic, TopicPostData } from '@/model/topic'
import SpatialAPI from '@/services/api/SpatialAPI'
import type { DatasetV2 } from '@datagouv/components'

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
  object: Ref<Topic | Partial<TopicPostData> | null | DatasetV2>
): Ref<SpatialCoverage | undefined> {
  const spatialCoverage = ref<SpatialCoverage | undefined>(undefined)

  watch(
    object,
    async (newObject) => {
      if (newObject?.spatial != null) {
        const coverage = await getZoneFromSpatial(newObject.spatial)
        spatialCoverage.value = coverage
      } else {
        spatialCoverage.value = undefined
      }
    },
    { immediate: true }
  )

  return spatialCoverage
}
