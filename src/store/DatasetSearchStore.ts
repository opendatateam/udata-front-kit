import DatasetsAPI from '@/services/api/resources/DatasetsAPI'
import type { DatasetV2 } from '@datagouv/components-next'
import { createSearchStore } from './GenericSearchStore'

// max search window for elasticsearch on data.gouv.fr
const ES_MAX_TOTAL = 10000
const searchAPI = new DatasetsAPI()

export const useDatasetSearchStore = createSearchStore<DatasetV2>({
  storeName: 'search',
  defaultPageKey: 'datasets',
  searchAPI,
  maxTotal: ES_MAX_TOTAL
})
