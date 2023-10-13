import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import { createDatasetStore } from '@/store/bouquet-datause-dataset'
import DatasetsAPI from '@/services/api/resources/DatasetsAPI'

beforeEach(async(context) => {
  setActivePinia(createPinia())
  const client = new DatasetsAPI
  const storeFactory = createDatasetStore(client);
  context.store = storeFactory()
})

test('get a dataset', async({store}) => {
  const dataset = await store.get('5de8f397634f4164071119c5')
  expect(dataset).not.toBeNull
})

test('get a dataset when a dataset is not found', async({store}) => {
  const dataset = await store.get('marvin')
  expect(dataset).toBeNull
})

