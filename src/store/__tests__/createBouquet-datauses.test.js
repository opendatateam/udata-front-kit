import { head, last } from 'lodash/fp/array'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test } from 'vitest'

import { useBouquetDatauseStore } from '@/store/createBouquet-datause'
import {
  deserializeDatauses,
  serializeDatauses,
  useBouquetDatausesStore
} from '@/store/createBouquet-datauses'

describe('serializeDatauses', () => {
  test('when params OK and one datause', () => {
    const datauses = [
      {
        name: 'name',
        description: 'description'
      }
    ]

    const { extras } = serializeDatauses(datauses)

    expect(last(extras.datauses).name).toBe(last(datauses).name)
    expect(last(extras.datauses).description).toBe(last(datauses).description)
  })

  test('when params OK and many datauses', () => {
    const datauses = [
      {
        name: 'name 1',
        description: 'description 1'
      },
      {
        name: 'name 2',
        description: 'description 2'
      }
    ]

    const { extras } = serializeDatauses(datauses)

    expect(last(extras.datauses).name).toBe(last(datauses).name)
    expect(head(extras.datauses).name).toBe(head(datauses).name)
  })

  test('when params KO', () => {
    const datauses = [
      {
        this: 'this',
        wont: 'wont',
        fail: 'fail'
      }
    ]

    const { extras } = serializeDatauses(datauses)

    expect(last(extras.datauses).this).toBeUndefined()
    expect(last(extras.datauses).name).toBeNull()
  })
})

describe('deserializeDatauses', () => {
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

    const { datauses } = deserializeDatauses(params)

    expect(last(datauses).name).toBe(last(params.extras.datauses).name)
  })

  test('when params OK and many datauses', () => {
    const params = {
      extras: {
        datauses: [
          {
            name: 'name 1',
            description: 'description 1'
          },
          {
            name: 'name 2',
            description: 'description 2'
          }
        ]
      }
    }

    const { datauses } = deserializeDatauses(params)

    expect(last(datauses).name).toBe(last(params.extras.datauses).name)
    expect(head(datauses).name).toBe(head(params.extras.datauses).name)
  })

  test('when params KO', () => {
    const params = {
      extras: {
        this: 'this',
        wont: 'wont',
        fail: 'fail'
      }
    }

    const { datauses } = deserializeDatauses(params)

    expect(datauses).toEqual([])
  })
})

describe('serialize', () => {
  beforeEach(async (context) => {
    setActivePinia(createPinia())
    context.datause = useBouquetDatauseStore()
    context.store = useBouquetDatausesStore()
  })

  test('when params OK and one datause', ({ datause, store }) => {
    datause.name = 'name'
    store.datauses = [datause]
    const datauses = [{ description: 'description' }]

    const { extras } = store.serialize(datauses)

    expect(last(extras.datauses).name).toBe(last(store.datauses).name)
    expect(last(extras.datauses).description).toBe(last(datauses).description)
  })

  test('when params OK and many datauses', ({ datause, store }) => {
    datause.name = 'name 1'
    store.datauses = [datause]

    const datauses = [
      { description: 'description 1' },
      { name: 'name 2', description: 'description 2' }
    ]

    const { extras } = store.serialize(datauses)

    expect(last(extras.datauses).name).toBe(last(datauses).name)
    expect(head(extras.datauses).name).toBe(datause.name)
  })

  test('when params KO', ({ datause, store }) => {
    datause.name = 'name 1'
    store.datauses = [datause]
    const datauses = [{ this: 'this' }]

    const { extras } = store.serialize(datauses)

    expect(last(extras.datauses).this).toBeUndefined()
    expect(last(extras.datauses).name).toBe(datause.name)
    expect(last(extras.datauses).description).toBeNull()
  })
})

describe('deserialize', () => {
  beforeEach(async (context) => {
    setActivePinia(createPinia())
    context.datause = useBouquetDatauseStore()
    context.store = useBouquetDatausesStore()
  })

  test('when params OK and one datause', ({ datause, store }) => {
    datause.name = 'old name'
    store.datauses = [datause]

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

    const { datauses } = store.deserialize(params)

    expect(last(datauses).name).toBe(last(params.extras.datauses).name)
  })

  test('when params OK and many datauses', ({ datause, store }) => {
    datause.name = 'old name'
    store.datauses = [datause]

    const params = {
      extras: {
        datauses: [
          {
            name: 'new name',
            description: 'description'
          },
          {
            name: 'name',
            description: 'description'
          }
        ]
      }
    }

    const { datauses } = store.deserialize(params)

    expect(last(datauses).name).toBe(last(params.extras.datauses).name)
    expect(head(datauses).name).toBe(head(params.extras.datauses).name)
  })

  test('when params KO', ({ datause, store }) => {
    datause.name = 'old name'
    store.datauses = [datause]

    const params = {
      this: 'this',
      extras: {
        that: 'that',
        datauses: [
          {
            name: 'new name'
          }
        ]
      }
    }

    const { datauses } = store.deserialize(params)

    expect(last(datauses).this).toBeUndefined()
    expect(last(datauses).name).toBe(last(params.extras.datauses).name)
    expect(last(datauses).description).toBeNull()
  })
})
