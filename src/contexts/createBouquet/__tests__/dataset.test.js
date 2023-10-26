import { head, last } from 'lodash/fp/array'
import { beforeEach, describe, expect, test } from 'vitest'

import Dataset from '@/contexts/createBouquet/dataset'

beforeEach((context) => {
  context.id = 'id'
  context.title = 'title'
  context.description = 'description'
})

test('serialize', ({ id, title, description }) => {
  const dataset = new Dataset({ id, title, description })

  const {
    datasets: [data]
  } = dataset.serialize()

  expect(data.id).toEqual(id)
})

describe('deserialize', () => {
  test('when one dataset', ({ id, title, description }) => {
    const data = {
      datasets: [
        {
          id,
          title,
          description
        }
      ]
    }

    const [dataset] = Dataset.deserialize(data)

    expect(dataset.id).toEqual(id)
  })

  test('when many datasets', ({ title, description }) => {
    const data = {
      datasets: [
        {
          id: '1',
          title,
          description
        },
        {
          id: '2',
          title,
          description
        },
        {
          id: '3',
          title,
          description
        }
      ]
    }

    const datasets = Dataset.deserialize(data)

    expect(head(datasets).id).toEqual('1')
    expect(last(datasets).id).toEqual('3')
  })

  test('when data KO', ({ description }) => {
    const data = {
      this: 'this',
      datasets: [{ that: 'that', description }]
    }

    try {
      Dataset.deserialize(data)
    } catch (error) {
      expect(error.message).toMatch(/id is required/)
      expect(error.stack).toMatch(error.message)
    }
  })
})
