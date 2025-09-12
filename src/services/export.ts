import { Parser } from '@json2csv/plainjs'

import { Availability, type ResolvedFactor } from '@/model/topic'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { toastHttpError } from '@/utils/error'
import { isNotFoundError } from '@/utils/http'

interface DatasetRow {
  label: string
  label_description: string | null
  availability: string
  uri: string | null
  title?: string
  description?: string
  last_update?: string
  organization?: string
  group?: string
}

export const exportFactors = async (
  factors: ResolvedFactor[]
): Promise<Blob> => {
  const store = useDatasetStore()
  const headers = [
    'label',
    'label_description',
    'availability',
    'uri',
    'title',
    'description',
    'last_update',
    'organization',
    'group'
  ]
  const rows = await Promise.all(
    factors.map(async (factor) => {
      const row: DatasetRow = {
        label: factor.title,
        label_description: factor.description || '',
        availability: factor.siteExtras.availability,
        uri: factor.siteExtras.uri,
        group: factor.siteExtras.group
      }

      if (factor.element?.id == null) return row

      const remoteDataset = await store
        .load(factor.element.id, { toasted: false })
        .catch((error) => {
          if (isNotFoundError(error)) {
            row.availability = Availability.REMOTE_DELETED
          } else {
            toastHttpError(error)
          }
          return null
        })

      if (!remoteDataset) return row

      row.title = remoteDataset.title
      row.uri = remoteDataset.page
      row.description = remoteDataset.description
      row.last_update = remoteDataset.last_update
      row.organization = remoteDataset.organization?.name

      return row
    })
  )
  const parser = new Parser({ fields: headers })
  const csv = parser.parse(rows)

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}
