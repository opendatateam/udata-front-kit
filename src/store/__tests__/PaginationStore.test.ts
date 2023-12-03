import { last } from 'lodash/fp/array'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import { usePaginationStore } from '@/store/PaginationStore'

beforeEach((context) => {
  setActivePinia(createPinia())
  context.store = usePaginationStore()
})

test('calculate the number of pages', ({ store }) => {
  store.dataCount = 101
  store.dataPerPage = 50
  expect(store.pages).toEqual(3)
})

test('convert pages to array', ({ store }) => {
  store.dataCount = 100
  store.dataPerPage = 50
  expect(store.pagesToArray).toEqual([1, 2])
})

test('create pagination objects', ({ store }) => {
  const { pagination } = storeToRefs(store)
  store.dataCount = 200
  store.dataPerPage = 50
  expect(last(pagination.value).label).toEqual(4)
})
