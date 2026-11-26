import type { DatasetV2WithFullObject } from '@datagouv/components-next'

import { useDatasetStore } from '@/store/DatasetStore'

// mock sample dataset, shared by all source blocks for now
export const SAMPLE_DATASET_ID = '6ae223be71218d1466f1af54'

const pending = new Map<string, Promise<DatasetV2WithFullObject | null>>()

// shares one in-flight request between source blocks loading the same dataset
export function loadDataset(
  datasetId: string
): Promise<DatasetV2WithFullObject | null> {
  let promise = pending.get(datasetId)
  if (!promise) {
    promise = useDatasetStore()
      .load(datasetId)
      .catch(() => {
        pending.delete(datasetId)
        return null
      })
    pending.set(datasetId, promise)
  }
  return promise
}
