import { head, last } from 'lodash/fp/array'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test } from 'vitest'

import Bouquet from '@/contexts/createBouquet/bouquet'
import DatasetProperties from '@/contexts/createBouquet/datasetProperties'
import Scope from '@/contexts/createBouquet/scope'
import { createBouquetStore } from '@/store/createBouquet'

beforeEach(async (context) => {
  setActivePinia(createPinia())
  const client = () => {}
  const useBouquetStore = createBouquetStore(client)
  context.client = client
  context.store = useBouquetStore()
  context.bouquet = new Bouquet({
    title: 'title',
    description: 'description',
    tags: ['tag']
  })
})

describe('create a bouquet', () => {
  test('when params OK', async ({ client, store, bouquet }) => {
    client.create = ({ name, description, tags }) => ({
      status: 201,
      data: { id: 'id', name, description, tags }
    })

    await store.create(bouquet)

    expect(store.bouquet.id).not.toBeNull()
    expect(store.bouquet.title).toEqual(bouquet.title)
    expect(store.bouquet.description).toEqual(bouquet.description)
    expect(store.bouquet.tags).toStrictEqual(bouquet.tags)
  })

  test('when params KO', async ({ client, store, bouquet }) => {
    client.create = () => ({
      status: 400,
      error: 'error'
    })

    await store.create(bouquet)

    expect(store.error).toEqual('error')
  })

  test('when something else', async ({ client, store, bouquet }) => {
    client.create = () => ({
      status: 418,
      code: "I'm a teapot"
    })

    try {
      await store.create(bouquet)
    } catch (error) {
      expect(error.message).toMatch("I'm a teapot")
    }
  })
})

describe('add a scope to a bouquet', () => {
  beforeEach(async (context) => {
    const { store, bouquet } = context
    store.bouquet = bouquet
    store.bouquet.id = 'id'
    context.scope = new Scope({ theme: 'theme', subTheme: 'sub-theme' })
  })

  test('when params OK', async ({ client, store, scope }) => {
    client.update = (id, { name, description, tags, extras }) => ({
      status: 200,
      data: {
        id,
        name,
        description,
        tags,
        extras: {
          'scope:theme': extras['scope:theme'],
          'scope:sub-theme': extras['scope:sub-theme']
        }
      }
    })

    await store.addScope(scope)

    expect(store.bouquet.scope.theme).toBe(scope.theme)
    expect(store.bouquet.scope.subTheme).toBe(scope.subTheme)
  })

  test('when params KO', async ({ client, store, scope }) => {
    client.update = () => ({
      status: 400,
      error: 'error'
    })

    await store.addScope(scope)

    expect(store.error).toEqual('error')
  })

  test('when not found', async ({ client, store, scope }) => {
    client.update = () => ({
      status: 404,
      error: 'not found'
    })

    await store.addScope(scope)

    expect(store.error).toEqual('not found')
  })

  test('when something else', async ({ client, store, scope }) => {
    client.update = () => ({
      status: 418,
      code: "I'm a teapot"
    })

    try {
      await store.addScope(scope)
    } catch (error) {
      expect(error.message).toMatch("I'm a teapot")
    }
  })
})

describe('add a dataset properties to a bouquet', () => {
  beforeEach(async (context) => {
    const { store, bouquet } = context
    store.bouquet = bouquet
    store.bouquet.id = 'id'
    context.datasetProperties = new DatasetProperties({
      title: 'title',
      description: 'description',
      available: true
    })
  })

  test('when params OK', async ({ client, store, datasetProperties }) => {
    client.update = (id, { name, description, tags, extras }) => ({
      status: 200,
      data: {
        id,
        name,
        description,
        tags,
        extras
      }
    })

    await store.addDatasetProperties(
      new DatasetProperties({
        ...datasetProperties,
        title: `${datasetProperties.title} 1`
      })
    )

    await store.addDatasetProperties(
      new DatasetProperties({
        ...datasetProperties,
        title: `${datasetProperties.title} 2`
      })
    )

    await store.addDatasetProperties(
      new DatasetProperties({
        ...datasetProperties,
        title: `${datasetProperties.title} 3`
      })
    )

    const { datasetsProperties: props } = store.bouquet

    expect(head(props).title).toBe(`${datasetProperties.title} 1`)
    expect(last(props).title).toBe(`${datasetProperties.title} 3`)
  })

  test('when params KO', async ({ client, store, datasetProperties }) => {
    client.update = () => ({
      status: 400,
      error: 'error'
    })

    await store.addDatasetProperties(datasetProperties)

    expect(store.error).toEqual('error')
  })

  test('when not found', async ({ client, store, datasetProperties }) => {
    client.update = () => ({
      status: 404,
      error: 'not found'
    })

    await store.addDatasetProperties(datasetProperties)

    expect(store.error).toEqual('not found')
  })

  test('when something else', async ({ client, store, datasetProperties }) => {
    client.update = () => ({
      status: 418,
      code: "I'm a teapot"
    })

    try {
      await store.addDatasetProperties(datasetProperties)
    } catch (error) {
      expect(error.message).toMatch("I'm a teapot")
    }
  })
})
