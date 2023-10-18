import { head, last } from 'lodash/fp/array'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { createBouquetStore } from '@/store/createBouquet'

beforeEach(async (context) => {
  setActivePinia(createPinia())
  const client = new TopicsAPI()
  const storeFactory = createBouquetStore(client)
  context.client = client
  context.store = storeFactory()
})

afterEach(async ({ client, store }) => {
  const id = store?.bouquet?.id

  if (id) {
    const respose = await client.delete(id)
    expect(respose.status).toBe(204)
  }
})

describe('create bouquet', () => {
  test('when params OK', async ({ store }) => {
    const params = {
      name: 'name',
      description: 'description',
      tags: ['tag']
    }

    const { bouquet } = await store.create(params)

    expect(bouquet.id).not.toBeNull()
    expect(bouquet.name).toBe(params.name)
    expect(bouquet.description).toBe(params.description)
    expect(bouquet.tags).toStrictEqual(params.tags)
  })

  test('when params KO', async ({ store }) => {
    const params = {
      name: 'name',
      tags: ['tag']
    }

    const { error } = await store.create(params)

    expect(error).toBe('error')
  })
})

describe('add information to bouquet', () => {
  beforeEach(async ({ store }) => {
    const params = {
      name: 'test',
      description: 'test',
      tags: ['test']
    }
    await store.create(params)
  })

  test('when params OK', async ({ store }) => {
    const params = {
      subject: 'subject',
      theme: 'theme',
      subTheme: 'subTheme'
    }

    const {
      bouquet: { information }
    } = await store.addInformation(params)

    expect(information.subject).toBe(params.subject)
    expect(information.theme).toBe(params.theme)
    expect(information.subTheme).toBe(params.subTheme)
  })
})

describe('add datause to bouquet', () => {
  beforeEach(async ({ store }) => {
    const params = {
      name: 'name',
      description: 'description',
      tags: ['tags']
    }
    await store.create(params)
  })

  test('when params OK and one datause', async ({ store }) => {
    const params = [
      {
        name: 'name',
        description: 'description'
      }
    ]

    const {
      bouquet: {
        datauses: { datauses }
      }
    } = await store.addDatause(params)

    expect(last(datauses).name).toBe(last(params).name)
    expect(last(datauses).description).toBe(last(params).description)
  })

  test('when params OK and many datauses', async ({ store }) => {
    const params = [
      {
        name: 'name 1',
        description: 'description 1'
      },
      {
        name: 'name 2',
        description: 'description 2'
      }
    ]

    const {
      bouquet: {
        datauses: { datauses }
      }
    } = await store.addDatause(params)

    expect(last(datauses).name).toBe(last(params).name)
    expect(head(datauses).name).toBe(head(params).name)
  })

  test('when params KO', async ({ store }) => {
    const params = [
      {
        this: 'this',
        that: 'that'
      },
      {
        name: 'name 2',
        description: 'description 2'
      }
    ]

    const {
      bouquet: {
        datauses: { datauses }
      }
    } = await store.addDatause(params)

    expect(last(datauses).name).toBe(last(params).name)
    expect(head(datauses).name).toBeNull()
  })
})
