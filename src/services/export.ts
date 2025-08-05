import { Parser } from '@json2csv/plainjs'

import { Availability, type DatasetProperties } from '@/model/topic'
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

export const exportDatasets = async (
  datasets: DatasetProperties[]
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
    datasets.map(async (datasetProperties) => {
      const row: DatasetRow = {
        label: datasetProperties.title,
        label_description: datasetProperties.purpose,
        availability: datasetProperties.availability,
        uri: datasetProperties.uri,
        group: datasetProperties.group
      }

      if (datasetProperties.id == null) return row

      const remoteDataset = await store
        .load(datasetProperties.id, { toasted: false })
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
