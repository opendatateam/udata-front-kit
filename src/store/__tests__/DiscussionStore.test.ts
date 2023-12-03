import { last } from 'lodash/fp/array'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { v4 as uuid } from 'uuid'
import { beforeEach, describe, expect, test } from 'vitest'

import { useDiscussionStore } from '@/store/DiscussionStore'

const subject = { class: 'Topic', id: uuid() }

const user = { first_name: 'Jean', last_name: 'Serien' }

const discussion = {
  discussion: {
    content: 'Coucou !',
    posted_by: user,
    posted_on: '2022-03-18T16:38:37.360000+00:00'
  }
}

beforeEach((context) => {
  setActivePinia(createPinia())
  context.store = useDiscussionStore()
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
