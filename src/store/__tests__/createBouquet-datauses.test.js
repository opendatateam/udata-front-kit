import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, expect, test, describe } from 'vitest'

import { useBouquetDatauseStore } from '@/store/createBouquet-datauses'

beforeEach(async(context) => {
  setActivePinia(createPinia())
  context.store = useBouquetDatauseStore()
})

// describe('serialize', () => {
//   describe('when store does not exist', () => {
//     test('when params OK', async ({ store }) => {
//       const datauses = {
//         name: 'name test',
//         description: 'description test'
//       }

//       const {extras} = store.serialize({ datauses })

//       expect(extras['information:subject']).toBe(datause.subject)
//       expect(extras['information:theme']).toBe(information.theme)
//     })

//     test('when params KO', async ({ store }) => {
//       const information = {
//         this: 'subject test',
//         wont: 'theme test',
//         fail: 'subTheme test'
//       }

//       const {extras} = store.serialize({ information })

//       expect(extras['information:subject']).toBeNull()
//       expect(extras['information:theme']).toBeNull()
//       expect(extras['information:sub-theme']).toBeNull()
//     })
//   })

//   describe('when store exists', () => {
//     beforeEach(async (context) => {
//       setActivePinia(createPinia())
//       const store = useBouquetDatauseStore()
//       const information = {
//         subject: 'subject test existing',
//         theme: 'theme test existing',
//         subTheme: 'subTheme test existing'
//       }
//       context.store = store.create(information)
//     })

//     test('when params OK', async ({ store }) => {
//       const information = {
//         subject: 'subject test changed',
//         theme: 'theme test changed',
//         subTheme: 'subTheme test changed'
//       }

//       const {extras} = store.serialize({ information })

//       expect(extras['information:subject']).toBe(information.subject)
//       expect(extras['information:theme']).toBe(information.theme)
//       expect(extras['information:sub-theme']).toBe(information.subTheme)
//     })

//     test('when params KO', async ({ store }) => {
//       const information = {
//         this: 'subject test',
//         wont: 'theme test',
//         fail: 'subTheme test'
//       }

//       const {extras} = store.serialize({ information })

//       expect(extras['information:subject']).toBe(store.subject)
//       expect(extras['information:theme']).toBe(store.theme)
//       expect(extras['information:sub-theme']).toBe(store.subTheme)
//     })
//   })
// })

describe('deserialize', () => {
  describe('when store does not exist', () => {
    test('when params OK and only one datause', async ({ store }) => {
      const datauses = [
        {
          name: 'name test',
          description: 'description test'
        }
      ]

      const deserialized = store.deserialize({ extras: {datauses: datauses} })

      expect(deserialized[0].name).toBe(datauses[0].name)
      expect(deserialized[0].description).toBe(datauses[0].description)
    })

    test('when params OK and many datauses', async ({ store }) => {
      const datauses = [
        {
          name: 'name test',
          description: 'description test'
        },
        {
          name: 'name test 2',
          description: 'description test 2'
        },
        {
          name: 'name test 3',
          description: 'description test 3'
        }
      ]

      const deserialized = store.deserialize({ extras: { datauses: datauses } })

      expect(deserialized[0].name).toBe(datauses[0].name)
      expect(deserialized[0].description).toBe(datauses[0].description)
      expect(deserialized[1].name).toBe(datauses[1].name)
      expect(deserialized[1].description).toBe(datauses[1].description)
      expect(deserialized[2].name).toBe(datauses[2].name)
      expect(deserialized[2].description).toBe(datauses[2].description)
    })

    test('when params KO', async ({ store }) => {
      const datauses = [{
        this: 'name test',
        wont: 'description test'
      }]

      const deserialized = store.deserialize({ extras: { datauses: datauses } })

      expect(deserialized[0].name).toBeUndefined()
      expect(deserialized[0].description).toBeUndefined()
    })
  })

  // describe('when store exists', () => {
  //   beforeEach(async (context) => {
  //     const store = useBouquetDatauseStore()
  //     const information = {
  //       subject: 'subject test existing',
  //       theme: 'theme test existing',
  //       subTheme: 'subTheme test existing'
  //     }
  //     context.store = store.create(information)
  //   })

  //   test('when params OK', async ({ store }) => {
  //     const information = {
  //       'information:subject': 'subject test changed',
  //       'information:theme': 'theme test changed',
  //       'information:sub-theme': 'subTheme test changed'
  //     }

  //     const deserialized = store.deserialize({ extras: information })

  //     expect(deserialized.subject).toBe(information['information:subject'])
  //     expect(deserialized.theme).toBe(information['information:theme'])
  //     expect(deserialized.subTheme).toBe(information['information:sub-theme'])
  //   })

  //   test('when params KO', async ({ store }) => {
  //     const information = {
  //       this: 'subject test',
  //       wont: 'theme test',
  //       fail: 'subTheme test'
  //     }

  //     const deserialized = store.deserialize({ extras: information })

  //     expect(deserialized.subject).toBeNull
  //     expect(deserialized.theme).toBeNull
  //     expect(deserialized.subTheme).toBeNull
  //   })
  // })
})