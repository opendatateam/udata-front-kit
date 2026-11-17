import type { ExtendedDatasetV2WithFullObject } from '@/model/dataset'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import type {
  DatasetV2WithFullObject,
  TranslatedBadge
} from '@datagouv/components-next'

export const getParentDatasetId = (
  dataset: DatasetV2WithFullObject | undefined
): string | undefined =>
  (dataset as ExtendedDatasetV2WithFullObject | undefined)?.extras?.dcat
    ?.parent || undefined

export const useBadges = (
  dataset: Ref<DatasetV2WithFullObject | undefined>
): Ref<TranslatedBadge[]> => {
  const datasetStore = useDatasetStore()
  const badges = ref<TranslatedBadge[]>([])
  watch(
    dataset,
    async () => {
      if (dataset.value) {
        const badgeLabels = await datasetStore.getBadges()
        badges.value = dataset.value.badges.flatMap((b) => {
          const label = badgeLabels[b.kind]
          return label ? [{ kind: b.kind, label }] : []
        })
      }
    },
    { immediate: true }
  )
  return badges
}
