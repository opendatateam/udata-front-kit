import { last } from 'lodash'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import type { Page } from '@/model/page'
import { usePaginationStore } from '@/store/PaginationStore'

interface C {
  store: ReturnType<typeof usePaginationStore>
}

beforeEach((context: C): void => {
  setActivePinia(createPinia())
  context.store = usePaginationStore()
})

test('calculate the number of pages', ({ store }: C): void => {
  store.dataCount = 101
  store.dataPerPage = 50
  expect(store.pagesCount).toEqual(3)
})

test('convert pages to array', ({ store }: C): void => {
  store.dataCount = 100
  store.dataPerPage = 50
  expect(store.pagesToArray).toEqual([1, 2])
})

test('create pagination objects', ({ store }: C): void => {
  store.dataCount = 200
  store.dataPerPage = 50
  expect((last(store.pages) as Page).label).toEqual('4')
})
