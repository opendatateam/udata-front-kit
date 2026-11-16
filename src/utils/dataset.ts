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

// DOI minted by data.gouv.fr, else the one declared by the harvest source
export const getDatasetDoi = (
  dataset: ExtendedDatasetV2WithFullObject
): string | null => dataset.doi ?? dataset.harvest?.doi ?? null

// DOI eligibility: public dataset published by an organization
export const canRequestDoi = (dataset: DatasetV2WithFullObject): boolean =>
  !!dataset.organization &&
  !dataset.private &&
  !dataset.deleted &&
  !dataset.archived

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
