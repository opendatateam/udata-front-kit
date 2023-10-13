import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, expect, test, describe } from 'vitest'

import { createBouquetStore } from '@/store/createBouquet'
import TopicsAPI from '@/services/api/resources/TopicsAPI'

describe('create bouquet', () => {
  beforeEach(async(context) => {
    setActivePinia(createPinia())
    const client = new TopicsAPI
    const storeFactory = createBouquetStore(client);
    context.store = storeFactory()
  })

  test('create a bouquet', async({store}) => {
    const bouquet = {
      name: "test",
      description: "test",
      tags: ['test'],
    }
    const {data} = await store.create(bouquet)
    expect(data.name).toBe(bouquet.name)
    expect(data.description).toBe(bouquet.description)
    expect(data.tags).toStrictEqual(bouquet.tags)
  })
  
  test('create a bouquet when description is not provided', async({store}) => {
    const bouquet = {
      name: "test",
      tags: ['test']
    }
    const {error} = await store.create(bouquet)
    expect(error).toBe('error')
  })
})

describe('add information of bouquet', () => {
  beforeEach(async(context) => {
    setActivePinia(createPinia())
    const client = new TopicsAPI
    const storeFactory = createBouquetStore(client);
    const store = storeFactory()
    const bouquet = {
      name: "test",
      description: "test",
      tags: ['test'],
    }
    await store.create(bouquet)
    context.store = store
  })
  
  test('edit a bouquet', async({store}) => {
    const bouquetInformation = {
      subject: 'subject test',
      theme: 'theme test',
      subTheme: 'subTheme test'
    }

    const {data:{information}} = await store.addInformation(bouquetInformation)
    expect (information.subject).toBe(bouquetInformation.subject)
    expect (information.theme).toBe(bouquetInformation.theme)
    expect (information.subTheme).toBe(bouquetInformation.subTheme)
  })
})


