import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, expect, test, describe } from 'vitest'

import { useBouquetInformationStore } from '@/store/createBouquet-information'

describe('serialize', () => {
  beforeEach(async(context) => {
    setActivePinia(createPinia())
    context.store = useBouquetInformationStore()
  })

  describe('when store does not exist', () => {
    beforeEach(async (context) => {
      setActivePinia(createPinia())
      context.store = useBouquetInformationStore()
    })

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