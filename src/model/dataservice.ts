import type { Dataservice, Owned, Rel } from '@datagouv/components-next'

import type { GenericResponse } from './api'

// TODO: this should probably be fixed upstream as main Dataservice type
// Using Owned explicitly to preserve the discriminated union
export type DataserviceWithRel = Owned &
  Omit<Dataservice, 'datasets' | 'organization' | 'owner'> & {
    datasets: Rel
  }

export interface DataserviceResponse extends GenericResponse {
  data: DataserviceWithRel[]
}
