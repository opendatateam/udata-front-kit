import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, expect, test, describe } from 'vitest'

import { useBouquetInformationStore } from '@/store/createBouquet-information'

beforeEach(async(context) => {
  setActivePinia(createPinia())
  context.store = useBouquetInformationStore()
})

describe('serialize', () => {
  describe('when store does not exist', () => {
    test('when params OK', async ({ store }) => {
      const information = {
        subject: 'subject test',
        theme: 'theme test',
        subTheme: 'subTheme test'
      }

      const {extras} = store.serialize({ information })

      expect(extras['information:subject']).toBe(information.subject)
      expect(extras['information:theme']).toBe(information.theme)
      expect(extras['information:sub-theme']).toBe(information.subTheme)
    })

    test('when params KO', async ({ store }) => {
      const information = {
        this: 'subject test',
        wont: 'theme test',
        fail: 'subTheme test'
      }

      const {extras} = store.serialize({ information })

      expect(extras['information:subject']).toBeNull()
      expect(extras['information:theme']).toBeNull()
      expect(extras['information:sub-theme']).toBeNull()
    })
  })

  describe('when store exists', () => {
    beforeEach(async (context) => {
      setActivePinia(createPinia())
      const store = useBouquetInformationStore()
      const information = {
        subject: 'subject test existing',
        theme: 'theme test existing',
        subTheme: 'subTheme test existing'
      }
      context.store = store.create(information)
    })

    test('when params OK', async ({ store }) => {
      const information = {
        subject: 'subject test changed',
        theme: 'theme test changed',
        subTheme: 'subTheme test changed'
      }

      const {extras} = store.serialize({ information })

      expect(extras['information:subject']).toBe(information.subject)
      expect(extras['information:theme']).toBe(information.theme)
      expect(extras['information:sub-theme']).toBe(information.subTheme)
    })

    test('when params KO', async ({ store }) => {
      const information = {
        this: 'subject test',
        wont: 'theme test',
        fail: 'subTheme test'
      }

      const {extras} = store.serialize({ information })

      expect(extras['information:subject']).toBe(store.subject)
      expect(extras['information:theme']).toBe(store.theme)
      expect(extras['information:sub-theme']).toBe(store.subTheme)
    })
  })
})

describe('deserialize', () => {
  describe('when store does not exist', () => {
    test('when params OK', async ({ store }) => {
      const information = {
        'information:subject': 'subject test',
        'information:theme': 'theme test',
        'information:sub-theme': 'subTheme test'
      }

      const deserialized = store.deserialize({ extras: information })

      expect(deserialized.subject).toBe(information['information:subject'])
      expect(deserialized.theme).toBe(information['information:theme'])
      expect(deserialized.subTheme).toBe(information['information:sub-theme'])
    })
  })


})