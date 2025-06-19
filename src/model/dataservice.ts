import type { Dataservice, Rel } from '@datagouv/components'

import type { GenericResponse } from './api'

export type DataserviceWithRel = Omit<Dataservice, 'datasets'> & {
  datasets: Rel
  // FIXME: those should be upstream, force them for now
  access_type: 'open' | 'open_with_account' | 'restricted'
  machine_documentation_url: string | null
}

export interface DataserviceResponse extends GenericResponse {
  data: Dataservice[]
}
