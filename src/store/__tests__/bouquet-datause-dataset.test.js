import { setActivePinia, createPinia } from 'pinia'
import { expect, test } from 'vitest'

import { createDatasetStore } from '../bouquet-datause-dataset'
import found from '../__fixtures__/datasetResponse/found.json'
import notFound from '../__fixtures__/datasetResponse/notFound.json'

test('get a dataset', async() => {
  setActivePinia(createPinia())
  const get = (_id) => found
  const storeFactory = createDatasetStore({ get });
  const store = storeFactory()
  const dataset = await store.get(found.id)
  expect(dataset.name).toMatch("Fichier des personnes décédées")
  expect(dataset.uri).toMatch("https://www.data.gouv.fr/fr/datasets/")
})

test('get a dataset when a dataset is not found', async() => {
  setActivePinia(createPinia())
  const get = (_id) => notFound
  const storeFactory = createDatasetStore({ get });
  const store = storeFactory()
  const dataset = await store.get(notFound.id)
  expect(dataset.name).toBeNull
  expect(dataset.uri).toBeNull
})

