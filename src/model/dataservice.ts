import type { Dataservice, Rel } from '@datagouv/components-next'

import type { GenericResponse } from './api'

export type DataserviceWithRel = Omit<Dataservice, 'datasets'> & {
  datasets: Rel
}

export interface DataserviceResponse extends GenericResponse {
  data: Dataservice[]
}
