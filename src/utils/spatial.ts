import { ref, watch, type Ref } from 'vue'

import type { SpatialCoverage, SpatialField } from '@/model/spatial'
import type { Topic, TopicPostData } from '@/model/topic'
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
  topic: Ref<Topic | Partial<TopicPostData> | null>
): Ref<SpatialCoverage | undefined> {
  const spatialCoverage = ref<SpatialCoverage | undefined>(undefined)

  watch(
    topic,
    async (newTopic) => {
      if (newTopic?.spatial != null) {
        const coverage = await getZoneFromSpatial(newTopic.spatial)
        spatialCoverage.value = coverage
      } else {
        spatialCoverage.value = undefined
      }
    },
    { immediate: true }
  )

  return spatialCoverage
}
