import type { Owned } from '@datagouv/components'

import { useTopicsConf } from '@/utils/config'

import type { GenericResponse } from './api'

// FIXME:
const { topicsName } = useTopicsConf()

export type Reuse = Owned & {
  id: string
  title: string
  created_at: string
  image_thumbnail?: string
  type: string
  page: string
}

export interface ReuseResponse extends GenericResponse {
  data: Reuse[]
}

export interface ReuseType {
  id: string
  label: string
}

// use a const instead of an interface to be compatible with topicsName as a variable
export const ReuseModel = {
  dataset: 'jeu de donnée',
  topic: topicsName
}
