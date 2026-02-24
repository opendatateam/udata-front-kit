import DataserviceSearchAPI from '@/services/api/resources/DataservicesAPI'
import type { Dataservice } from '@datagouv/components-next'
import { createSearchStore } from './GenericSearchStore'

// max search window for elasticsearch on data.gouv.fr
const searchAPI = new DataserviceSearchAPI()

export const useDataserviceSearchStore = createSearchStore<Dataservice>({
  storeName: 'dataserviceSearch',
  defaultPageKey: 'dataservices',
  searchAPI,
  maxTotal: null
})
