import type { DatasetV2 } from '@datagouv/components-next'
import {
  computed,
  inject,
  provide,
  type ComputedRef,
  type InjectionKey,
  type Ref
} from 'vue'

import { ACTIVITY_DATASET_SLUG } from '@/custom/justice/utils/activityData'
import { useDatasetStore } from '@/store/DatasetStore'

const JUSTICE_DATASET: InjectionKey<ComputedRef<DatasetV2 | null>> =
  Symbol('justice-dataset')

export async function loadJusticeDataset(): Promise<DatasetV2 | null> {
  return useDatasetStore()
    .load(ACTIVITY_DATASET_SLUG)
    .catch(() => null)
}

export function provideJusticeDataset(dataset: Ref<DatasetV2 | null>) {
  provide(
    JUSTICE_DATASET,
    computed(() => dataset.value)
  )
}

export function useJusticeDataset() {
  const dataset = inject(
    JUSTICE_DATASET,
    computed(() => null)
  )
  const datasetUrl = computed(() =>
    dataset.value
      ? { name: 'datasets_detail', params: { item_id: dataset.value.slug } }
      : undefined
  )
  return { dataset, datasetUrl }
}
