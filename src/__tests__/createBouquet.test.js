import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, expect, test, describe } from 'vitest'

import { createBouquetStore } from '@/store/bouquet'
import TopicsAPI from '@/services/api/resources/TopicsAPI'

describe('create bouquet', () => {
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
      tags: ['test'],
    }
    const {data} = await store.create(payload)
    expect(data.name).toBe(payload.name)
    expect(data.description).toBe(payload.description)
    expect(data.tags).toStrictEqual(payload.tags)
  })
  
  test('create a bouquet when description is not provided', async({store}) => {
    const payload = {
      name: "test",
      tags: ['test']
    }
    const {error} = await store.create(payload)
    expect(error).toBe('error')
  })
})

describe('update bouquet', () => {
  beforeEach(async(context) => {
    setActivePinia(createPinia())
    const client = new TopicsAPI
    const storeFactory = createBouquetStore(client);
    const store = storeFactory()
    const payload = {
      name: "test",
      description: "test",
      tags: ['test'],
    }
    await store.create(payload)
    context.store = store
  })
  
  test('edit a bouquet', async({store}) => {
    const payload = {
      subject: 'subject test',
      theme: 'theme test',
      subTheme: 'subTheme test'
    }

    const {data} = await store.update(payload)
    expect (data.subject).toBe(payload.subject)
    expect (data.theme).toBe(payload.theme)
    expect (data.subTheme).toBe(payload.subTheme)
  })
})

