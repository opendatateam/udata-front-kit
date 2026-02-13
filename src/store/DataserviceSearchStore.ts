import type { DataserviceWithRel } from '@/model/dataservice'
import DataservicesAPI from '@/services/api/resources/DataservicesAPI'
import { createSearchStore } from './GenericSearchStore'

const searchAPI = new DataservicesAPI()

export const useDataserviceSearchStore = createSearchStore<DataserviceWithRel>({
  storeName: 'dataserviceSearch',
  defaultPageKey: 'dataservices',
  searchAPI,
  maxTotal: null
})
