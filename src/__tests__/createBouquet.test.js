import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import { createBouquetStore } from '@/store/bouquet'
import TopicsAPI from '@/services/api/resources/TopicsAPI'

beforeEach(async(context) => {
  setActivePinia(createPinia())
  const client = new TopicsAPI
  const storeFactory = createBouquetStore(client);
  context.store = storeFactory()
})

test('create a bouquet', async({store}) => {
  const payload = {
    name: "test",
    description: "test",
    tags: ['test']
  }
  const {data} = await store.create(payload)
  expect(data.name).toBe(payload.name)
  expect(data.description).toBe(payload.description)
})

test('create a bouquet when description is not provided', async({store}) => {
  const payload = {
    name: "test",
    tags: ['test']
  }
  const {error} = await store.create(payload)
  expect(error).toBe('error')
})

