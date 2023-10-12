import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import { createDatasetStore } from '../bouquet-datause-dataset'
import datasetResponse from '../__fixtures__/datasetResponse'

beforeEach(async(context) => {
  setActivePinia(createPinia())
  const get = (_id) => datasetResponse
  context.store = createDatasetStore({ get });
})

test('get a dataset', async({ store }) => {
  const dataset = await store.get(datasetResponse.id)
  expect(dataset.name).toMatch("Fichier des personnes décédées")
  expect(dataset.uri).toMatch("https://www.data.gouv.fr/fr/datasets/")
})