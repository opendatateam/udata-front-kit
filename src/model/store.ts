import type { Data, Page } from './api'

type DataByUUID<T> = Record<string, DataByPage<T>>

type DataByPage<T> = Record<Page, Data<T>['data']>

export type { DataByUUID, DataByPage }
