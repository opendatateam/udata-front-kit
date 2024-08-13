import type { Owned } from '@datagouv/components'

import { useTopicsConf } from '@/utils/config'

import type { GenericResponse } from './api'

const { topicName } = useTopicsConf()

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

export enum ReuseModel {
  dataset = 'jeu de donnée',
  // FIXME:
  topic = topicName as any
}
