import { beforeEach, describe, expect, test } from 'vitest'

import DomainModel from '@/contexts/createBouquet/datasetProperties'

beforeEach(async (context) => {
  context.bouquetURI = 'https://machin.truc/bouquet/1'
  context.name_ = 'name'
  context.description = 'description'
  context.datasetURI = 'https://machin.bidule/dataset/1'
})

test('serialize', ({ bouquetURI, name_, description }) => {
  const domain = new DomainModel(bouquetURI, name_, description)

  const {
    extras: {
      datasets_properties: [data]
    }
  } = domain.serialize()

  expect(data.name).toEqual(name_)
  expect(data.description).toEqual(description)
  expect(data.links.bouquet).toEqual(bouquetURI)
  expect(data.links.dataset).toBeNull()
})

describe('deserialize', () => {
  test('when data OK and one dataset properties', ({
    bouquetURI,
    name_,
    description,
    datasetURI
  }) => {
    const data = {
      extras: {
        datasets_properties: [
          {
            name: name_,
            description,
            links: { bouquet: bouquetURI, dataset: datasetURI }
          }
        ]
      }
    }

    const [domain] = DomainModel.deserialize(data)

    expect(domain.bouquetURI).toEqual(bouquetURI)
    expect(domain.name).toEqual(name_)
    expect(domain.description).toEqual(description)
    expect(domain.datasetURI).toEqual(datasetURI)
  })

  test('when data OK and many datasets properties', ({
    bouquetURI,
    name_,
    description
  }) => {
    const data = {
      extras: {
        datasets_properties: [
          {
            name: name_ + ' n-1',
            description,
            links: { bouquet: bouquetURI }
          },
          {
            name: name_,
            description,
            links: { bouquet: bouquetURI }
          }
        ]
      }
    }

    const [domain_head, domain_tail] = DomainModel.deserialize(data)

    expect(domain_head.name).not.toEqual(name_)
    expect(domain_tail.name).toEqual(name_)
  })

  test('when data KO', ({ description }) => {
    const data = {
      this: 'this',
      extras: { that: 'that', datasets_properties: [{ description }] }
    }

    try {
      DomainModel.deserialize(data)
    } catch (error) {
      expect(error.message).toMatch(/bouquetURI is required/)
      expect(error.stack).toMatch(error.message)
    }
  })
})
