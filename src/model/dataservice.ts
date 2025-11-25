import type { Dataservice, Rel } from '@datagouv/components-next'

import type { GenericResponse } from './api'

// TODO: this should probably be fixed upstream as main Dataservice type
export type DataserviceWithRel = Omit<Dataservice, 'datasets'> & {
  datasets: Rel
}

export interface DataserviceResponse extends GenericResponse {
  data: DataserviceWithRel[]
}
