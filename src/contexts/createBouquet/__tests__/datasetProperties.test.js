import { head, last } from 'lodash/fp/array'
import { beforeEach, describe, expect, test } from 'vitest'

import DatasetProperties from '@/contexts/createBouquet/datasetProperties'

beforeEach(async (context) => {
  context.title = 'title'
  context.description = 'description'
  context.id = '1'
  context.uri = 'https://machin.truc/dataset/1'
})

describe('new', () => {
  test('when data OK', ({ title, description }) => {
    const datasetProperties = new DatasetProperties({
      title,
      description,
      available: false
    })

    expect(datasetProperties.title).toEqual(title)
    expect(datasetProperties.description).toEqual(description)
    expect(datasetProperties.available).toBe(false)
    expect(datasetProperties.id).toBeNull()
    expect(datasetProperties.uri).toBeNull()
    expect(datasetProperties.missing).toBe(false)
  })

  test('when not title', () => {
    try {
      new DatasetProperties({})
    } catch (error) {
      expect(error.message).toMatch(/title is required/)
      expect(error.stack).toMatch(error.message)
    }
  })

  test('when not description', ({ title }) => {
    try {
      new DatasetProperties({ title })
    } catch (error) {
      expect(error.message).toMatch(/description is required/)
      expect(error.stack).toMatch(error.message)
    }
  })

  test('when available undefined', ({ title, description }) => {
    try {
      new DatasetProperties({ title, description })
    } catch (error) {
      expect(error.message).toMatch(/available is required/)
      expect(error.stack).toMatch(error.message)
    }
  })

  test('when available but not id nor uri', ({ title, description }) => {
    const datasetProperties = new DatasetProperties({
      title,
      description,
      available: true
    })

    expect(datasetProperties.title).toEqual(title)
    expect(datasetProperties.description).toEqual(description)
    expect(datasetProperties.available).toBe(true)
    expect(datasetProperties.id).toBeNull()
    expect(datasetProperties.uri).toBeNull()
    expect(datasetProperties.missing).toBe(true)
  })

  test('when both id and uri', ({ title, description, id, uri }) => {
    const datasetProperties = new DatasetProperties({
      title,
      description,
      available: true,
      id,
      uri
    })

    expect(datasetProperties.title).toEqual(title)
    expect(datasetProperties.description).toEqual(description)
    expect(datasetProperties.available).toBe(true)
    expect(datasetProperties.id).toEqual(id)
    expect(datasetProperties.uri).toBeNull()
    expect(datasetProperties.missing).toBe(false)
  })
})

test('serialize', ({ title, description }) => {
  const datasetProperties = new DatasetProperties({
    title,
    description,
    available: true
  })

  const {
    extras: {
      datasets_properties: [data]
    }
  } = datasetProperties.serialize()

  expect(data.title).toEqual(title)
  expect(data.description).toEqual(description)
  expect(data.available).toBe(true)
  expect(data.id).toBeNull()
  expect(data.uri).toBeNull()
  expect(data.missing).toBeUndefined()
})

describe('deserialize', () => {
  test('when one dataset properties', ({ title, description }) => {
    const data = {
      extras: {
        datasets_properties: [
          {
            title,
            description,
            available: true
          }
        ]
      }
    }

    const [datasetProperties] = DatasetProperties.deserialize(data)

    expect(datasetProperties.title).toEqual(title)
    expect(datasetProperties.description).toEqual(description)
    expect(datasetProperties.available).toBe(true)
    expect(datasetProperties.id).toBeNull()
    expect(datasetProperties.uri).toBeNull()
    expect(datasetProperties.missing).toBe(true)
  })

  test('when many datasets properties', ({ title, description }) => {
    const data = {
      extras: {
        datasets_properties: [
          {
            title,
            description,
            available: true
          },
          {
            title: `${title} + 1`,
            description,
            available: true
          },
          {
            title: `${title} + 2`,
            description,
            available: true
          }
        ]
      }
    }

    const datasets_properties = DatasetProperties.deserialize(data)

    expect(head(datasets_properties).title).toEqual(title)
    expect(last(datasets_properties).title).toEqual(`${title} + 2`)
  })

  test('when data KO', ({ description }) => {
    const data = {
      this: 'this',
      extras: { that: 'that', datasets_properties: [{ description }] }
    }

    try {
      DatasetProperties.deserialize(data)
    } catch (error) {
      expect(error.message).toMatch(/title is required/)
      expect(error.stack).toMatch(error.message)
    }
  })
})
