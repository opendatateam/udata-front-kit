import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import type {
  DatasetV2,
  License,
  TranslatedBadge
} from '@datagouv/components-next'

export const useLicense = (
  dataset: Ref<DatasetV2 | undefined>
): Ref<License | undefined> => {
  const datasetStore = useDatasetStore()
  const license = ref<License | undefined>(undefined)
  watch(
    dataset,
    async () => {
      if (dataset.value) {
        license.value = await datasetStore.getLicense(dataset.value.license)
      }
    },
    { immediate: true }
  )
  return license
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
