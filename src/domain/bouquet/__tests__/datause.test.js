import { beforeEach, describe, expect, test } from 'vitest'

import Datause from '@/domain/bouquet/datause'

beforeEach(async (context) => {
  context.title = 'name'
  context.description = 'description'
})

test('serialize', ({ title, description }) => {
  const datause = new Datause(title, description)

  const {
    extras: {
      datauses: [params]
    }
  } = datause.serialize()

  expect(params.name).toEqual(title)
  expect(params.description).toEqual(description)
})

describe('deserialize', () => {
  test('when params OK and one datause', ({ title, description }) => {
    const params = { extras: { datauses: [{ name: title, description }] } }

    const [datause] = Datause.deserialize(params)

    expect(datause.name).toEqual(title)
    expect(datause.description).toEqual(description)
  })

  test('when params OK and many datauses', ({ description }) => {
    const name1 = 'name 1'
    const name2 = 'name 2'

    const params = {
      extras: {
        datauses: [
          {
            name: name1,
            description
          },
          {
            name: name2,
            description
          }
        ]
      }
    }

    const [datause1, datause2] = Datause.deserialize(params)

    expect(datause1.name).toEqual(name1)
    expect(datause2.name).toEqual(name2)
  })

  test('when params KO', ({ description }) => {
    const params = {
      this: 'this',
      extras: { that: 'that', datauses: [{ description }] }
    }

    const [datause] = Datause.deserialize(params)

    expect(datause.this).toBeUndefined()
    expect(datause.name).toBeNull()
    expect(datause.description).toEqual(description)
  })
})
