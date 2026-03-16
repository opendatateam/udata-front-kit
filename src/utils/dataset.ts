import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import type {
<<<<<<< HEAD
  DatasetV2,
  License,
=======
  DatasetV2WithFullObject,
>>>>>>> origin/main
  TranslatedBadge
} from '@datagouv/components-next'

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

export const useBadges = (
  dataset: Ref<DatasetV2 | undefined>
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
