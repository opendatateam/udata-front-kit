import { ref, watch, type Ref } from 'vue'

import type {
  SpatialCoverage,
  SpatialCoverageLevel,
  SpatialField
} from '@/model/spatial'
import type { Topic, TopicPostData } from '@/model/topic'
import { useSpatialStore } from '@/store/SpatialStore'

export const getZoneFromSpatial = async (
  spatial: SpatialField | undefined | null
): Promise<SpatialCoverage | undefined> => {
  if (spatial == null) return
  const store = useSpatialStore()
  const zoneId = spatial.zones != null ? spatial.zones[0] : undefined
  if (zoneId !== undefined) {
    return await store.loadZone(zoneId)
  }
}

export function useSpatialCoverage(
  object: Ref<Topic | Partial<TopicPostData> | null>
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

export const getGranularityFromSpatial = async (
  spatial: SpatialField | undefined | null
): Promise<SpatialCoverageLevel | undefined> => {
  const store = useSpatialStore()
  if (spatial?.granularity) {
    await store.loadLevels()
    return store.getLevelById(spatial.granularity)
  }
}
