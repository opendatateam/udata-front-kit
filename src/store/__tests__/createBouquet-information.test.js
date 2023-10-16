import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, expect, test, describe } from 'vitest'

import {
  serializeInformation,
  deserializeInformation,
  useBouquetInformationStore
} from '@/store/createBouquet-information'

describe('serializeInformation', () => {
  test('when params OK', () => {
    const information = {
      subject: 'subject',
      theme: 'theme',
      subTheme: 'subTheme'
    }

    const {extras} = serializeInformation(information)

    expect(extras['information:subject']).toBe(information.subject)
    expect(extras['information:theme']).toBe(information.theme)
    expect(extras['information:sub-theme']).toBe(information.subTheme)
  })

  test('when params KO', () => {
    const information = {
      this: 'this',
      wont: 'wont',
      fail: 'fail'
    }

    const {extras} = serializeInformation(information)

    expect(extras.this).toBeUndefined()
    expect(extras['information:subject']).toBeNull()
  })
})

describe('deserializeInformation', () => {
  test('when params OK', () => {
    const params = {
      extras: {
        'information:subject': 'subject',
        'information:theme': 'theme',
        'information:sub-theme': 'subTheme'
      }
    }

    const information = deserializeInformation(params)

    expect(information.subject).toBe(params.extras['information:subject'])
    expect(information.theme).toBe(params.extras['information:theme'])
    expect(information.subTheme).toBe(params.extras['information:sub-theme'])
  })

  test('when params KO', () => {
    const params = {
      extras: {
        this: 'this',
        wont: 'wont',
        fail: 'fail'
      }
    }

    const information = deserializeInformation(params)

    expect(information.this).toBeUndefined()
    expect(information.subject).toBeNull()
  })
})

describe('serialize', () => {
  beforeEach(async (context) => {
    setActivePinia(createPinia())
    context.store = useBouquetInformationStore()
  })

  test('when params OK', ({ store }) => {
    store.subject = 'subject'

    const information = {
      theme: 'theme',
      subTheme: 'subTheme'
    }

    const {extras} = store.serialize(information)

    expect(extras['information:subject']).toBe(store.subject)
    expect(extras['information:theme']).toBe(information.theme)
    expect(extras['information:sub-theme']).toBe(information.subTheme)
  })

  test('when params KO', ({ store }) => {
    store.subject = 'subject'

    const information = {
      this: 'this',
      theme: 'theme',
    }

    const {extras} = store.serialize(information)

    expect(extras['information:this']).toBeUndefined()
    expect(extras['information:subject']).toBe(store.subject)
    expect(extras['information:theme']).toBe(information.theme)
    expect(extras['information:sub-theme']).toBeNull()
  })
})

describe('deserialize', () => {
  beforeEach(async (context) => {
    setActivePinia(createPinia())
    context.store = useBouquetInformationStore()
  })

  test('when params OK', ({ store }) => {
    store.subject = 'old subject'

    const params = {
      extras: {
        'information:subject': 'new subject',
        'information:theme': 'theme',
        'information:sub-theme': 'subTheme'
      }
    }

    const information = store.deserialize(params)

    expect(information.subject).toBe(params.extras['information:subject'])
    expect(information.theme).toBe(params.extras['information:theme'])
    expect(information.subTheme).toBe(params.extras['information:sub-theme'])
  })

  test('when params KO', ({ store }) => {
    store.subject = 'subject'

    const params = {
      extras: {
        this: 'this',
        'information:theme': 'theme',
      }
    }

    const information = store.deserialize(params)

    expect(information.this).toBeUndefined()
    expect(information.subject).toBe('subject')
    expect(information.theme).toBe('theme')
    expect(information.subTheme).toBeNull()
  })
})