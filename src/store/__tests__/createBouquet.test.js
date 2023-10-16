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

describe('add information to bouquet', () => {
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

describe('add datause to bouquet', () => {
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
  
  test('add datause to bouquet when there is no datause', async({store}) => {
    const bouquetDatause = {
      name: 'name test',
      description: 'description test'
    }

    const {data:{datauses}} = await store.addDatause(bouquetDatause)
    const datause = datauses[datauses.length - 1]
    expect (datause.name).toBe(bouquetDatause.name)
    expect (datause.description).toBe(bouquetDatause.description)
  })

  test('add datause to bouquet when there is a datause', async({store}) => {
    const bouquetDatause1 = {
      name: 'name test 1',
      description: 'description test 1'
    }
    const bouquetDatause2 = {
      name: 'name test 2',
      description: 'description test 2'
    }

    await store.addDatause(bouquetDatause1)
    const {data:{datauses}} = await store.addDatause(bouquetDatause2)
    const datause1 = datauses[datauses.length - 2]
    const datause2 = datauses[datauses.length - 1]
    expect (datause1.name).toBe(bouquetDatause1.name)
    expect (datause1.description).toBe(bouquetDatause1.description)
    expect (datause2.name).toBe(bouquetDatause2.name)
    expect (datause2.description).toBe(bouquetDatause2.description)
  })
})
