import type { DataserviceWithRel } from '@/model/dataservice'
import DataserviceSearchAPI from '@/services/api/resources/DataservicesAPI'
import { createSearchStore } from './GenericSearchStore'

// max search window for elasticsearch on data.gouv.fr
const searchAPI = new DataserviceSearchAPI()

export const useDataserviceSearchStore = createSearchStore<DataserviceWithRel>({
  storeName: 'dataserviceSearch',
  defaultPageKey: 'dataservices',
  searchAPI,
  maxTotal: null
})
