import { last } from 'lodash/fp/array'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test } from 'vitest'

import {
  NotImplementedError,
  deserializeDatause,
  serializeDatause,
  useBouquetDatauseStore
} from '@/store/createBouquet-datause'

describe('serializeDatause', () => {
  test('when params OK', () => {
    const datause = {
      name: 'name',
      description: 'description'
    }

    const { extras } = serializeDatause(datause)

    expect(last(extras.datauses).name).toBe(datause.name)
    expect(last(extras.datauses).description).toBe(datause.description)
  })

  test('when params KO', () => {
    const datause = {
      this: 'this',
      wont: 'wont',
      fail: 'fail'
    }

    const { extras } = serializeDatause(datause)

    expect(last(extras.datauses).this).toBeUndefined()
    expect(last(extras.datauses).name).toBeNull()
  })
})

describe('deserializeDatause', () => {
  test('when params OK and one datause', () => {
    const params = {
      extras: {
        datauses: [
          {
            name: 'name',
            description: 'description'
          }
        ]
      }
    }

    const datause = deserializeDatause(params)

    expect(datause.name).toBe(last(params.extras.datauses).name)
    expect(datause.description).toBe(last(params.extras.datauses).description)
  })

  test('when params OK and many datauses', () => {
    const params = {
      extras: {
        datauses: [
          {
            name: 'name',
            description: 'description'
          },
          {
            name: 'name',
            description: 'description'
          }
        ]
      }
    }

    try {
      deserializeDatause(params)
    } catch (error) {
      expect(error).toBeInstanceOf(NotImplementedError)
      expect(error.message).toMatch(/not implemented/i)
    }
  })

  test('when params KO', () => {
    const params = {
      this: 'this',
      wont: 'wont',
      fail: 'fail'
    }

    const datause = deserializeDatause(params)

    expect(datause.this).toBeUndefined()
    expect(datause.name).toBeNull()
  })
})

describe('serialize', () => {
  beforeEach(async (context) => {
    setActivePinia(createPinia())
    context.store = useBouquetDatauseStore()
  })

  test('when params OK', ({ store }) => {
    store.name = 'name'
    const datause = { description: 'description' }

    const { extras } = store.serialize(datause)

    expect(last(extras.datauses).name).toBe(store.name)
    expect(last(extras.datauses).description).toBe(datause.description)
  })

  test('when params KO', ({ store }) => {
    store.name = 'name'
    const datause = { this: 'this' }

    const { extras } = store.serialize(datause)

    expect(last(extras.datauses).this).toBeUndefined()
    expect(last(extras.datauses).name).toBe(store.name)
    expect(last(extras.datauses).description).toBeNull()
  })
})

describe('deserialize', () => {
  beforeEach(async (context) => {
    setActivePinia(createPinia())
    context.store = useBouquetDatauseStore()
  })

  test('when params OK and one datause', ({ store }) => {
    store.name = 'old name'

    const params = {
      extras: {
        datauses: [
          {
            name: 'new name',
            description: 'description'
          }
        ]
      }
    }

    const datause = store.deserialize(params)

    expect(datause.name).toBe(last(params.extras.datauses).name)
    expect(datause.description).toBe(last(params.extras.datauses).description)
  })

  test('when params OK and many datauses', ({ store }) => {
    const params = {
      extras: {
        datauses: [
          {
            name: 'name',
            description: 'description'
          },
          {
            name: 'name',
            description: 'description'
          }
        ]
      }
    }

    try {
      deserializeDatause(params)
    } catch (error) {
      expect(error).toBeInstanceOf(NotImplementedError)
      expect(error.message).toMatch(/not implemented/i)
    }
  })

  test('when params KO', ({ store }) => {
    store.name = 'name'

    const params = {
      this: 'this',
      extras: {
        that: 'that',
        datauses: [
          {
            description: 'description'
          }
        ]
      }
    }

    const datause = store.deserialize(params)

    expect(datause.this).toBeUndefined()
    expect(datause.name).toBe(store.name)
    expect(datause.description).toBe(last(params.extras.datauses).description)
  })
})
