import type { Owned } from '@etalab/data.gouv.fr-components'

import config from '@/config'

import type { GenericResponse } from './api'

const topicName = config.website.topics.topicName.name

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
  topic = topicName
}
