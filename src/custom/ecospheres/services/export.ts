import { Parser } from '@json2csv/plainjs'

import type { DatasetProperties } from '@/model'
import { useDatasetStore } from '@/store/DatasetStore'

interface DatasetRow {
  label: string
  label_description: string
  availability: string
  uri: string | null
  title?: string
  description?: string
  last_update?: string
  organization?: string
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
    'organization'
  ]
  const rows = await Promise.all(
    datasets.map(async (datasetProperties) => {
      const row: DatasetRow = {
        label: datasetProperties.title,
        label_description: datasetProperties.purpose,
        availability: datasetProperties.availability,
        uri: datasetProperties.uri
      }
      const remoteDataset =
        datasetProperties.id != null
          ? await store.load(datasetProperties.id)
          : null
      if (remoteDataset != null) {
        row.title = remoteDataset.title
        row.uri = remoteDataset.page
        row.description = remoteDataset.description
        row.last_update = remoteDataset.last_update
        row.organization = remoteDataset.organization?.name
      }
      return row
    })
  )
  const parser = new Parser({ fields: headers })
  const csv = parser.parse(rows)
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}
