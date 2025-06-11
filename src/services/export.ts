import { Parser } from '@json2csv/plainjs'

import { Availability, type DatasetElement } from '@/model/topic'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { useSiteId } from '@/utils/config'
import { toastHttpError } from '@/utils/error'
import { isNotFoundError } from '@/utils/http'

interface DatasetRow {
  label: string
  label_description: string
  availability: string
  uri: string | null
  title?: string
  description?: string
  last_update?: string
  organization?: string
  group?: string
}

export const exportElements = async (
  elements: DatasetElement[]
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
    elements.map(async (element) => {
      const siteExtras = element.extras[useSiteId()]
      const row: DatasetRow = {
        label: element.title,
        label_description: element.description || '',
        availability: siteExtras.availability,
        uri: siteExtras.uri,
        group: siteExtras.group
      }

      const remoteDataset =
        element.element?.id != null
          ? await store
              .load(element.element.id, { toasted: false })
              .catch((error) => {
                if (isNotFoundError(error)) {
                  row.availability = Availability.REMOTE_DELETED
                } else {
                  toastHttpError(error)
                }
              })
          : null

      if (remoteDataset == null) return row

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
