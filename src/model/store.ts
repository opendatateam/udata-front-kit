import type { Data as DataAPI, Meta } from './api'

type DataByUUID<T> = Record<string, DataByPage<T>>

type DataByPage<T> = Record<number, Data<T>>

interface Data<T> {
  items?: DataAPI<T>['data']
  meta?: Meta
}

export type { Data, DataByPage, DataByUUID }
