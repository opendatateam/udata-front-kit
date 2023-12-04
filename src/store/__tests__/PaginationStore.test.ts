import { last } from 'lodash'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import type { Pagination } from '@/model/pagination'
import { usePaginationStore } from '@/store/PaginationStore'

interface Context {
  store: ReturnType<typeof usePaginationStore>
}

beforeEach((context: Context): void => {
  setActivePinia(createPinia())
  context.store = usePaginationStore()
})

test('calculate the number of pages', ({ store }: Context): void => {
  store.dataCount = 101
  store.dataPerPage = 50
  expect(store.pages).toEqual(3)
})

test('convert pages to array', ({ store }: Context): void => {
  store.dataCount = 100
  store.dataPerPage = 50
  expect(store.pagesToArray).toEqual([1, 2])
})

test('create pagination objects', ({ store }: Context): void => {
  store.dataCount = 200
  store.dataPerPage = 50
  expect((last(store.pagination) as Pagination).label).toEqual(4)
})
