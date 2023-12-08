import type { Data, Meta } from './api'

type CacheByUUID<T> = Record<string, CacheByPage<T>>

type CacheByPage<T> = Record<number, Cache<T>>

interface Cache<T> {
  items?: Data<T>['data']
  meta?: Meta
}

export type { Cache, CacheByPage, CacheByUUID }
