import { head, last } from 'lodash/fp/array'
import { beforeEach, describe, expect, test } from 'vitest'

import Bouquet from '@/contexts/createBouquet/bouquet'
import Dataset from '@/contexts/createBouquet/dataset'
import DatasetProperties from '@/contexts/createBouquet/datasetProperties'
import Scope from '@/contexts/createBouquet/scope'

beforeEach(async (context) => {
  context.id = '1'
  context.title = 'title'
  context.description = 'description'
  context.tags = ['tag']
})

describe('new', () => {
  test('when props OK', ({ title, description, tags }) => {
    const bouquet = new Bouquet({ title, description, tags })

    expect(bouquet.id).toBeUndefined()
    expect(bouquet.title).toEqual(title)
    expect(bouquet.description).toEqual(description)
    expect(bouquet.tags).toStrictEqual(tags)
    expect(bouquet.scope).toBeNull()
    expect(bouquet.datasets_properties).toStrictEqual([])
    expect(bouquet.datasets).toStrictEqual([])
    expect(bouquet.draft).toBe(true)
    expect(bouquet.published).toBe(false)
    expect(bouquet.persisted).toBe(false)
  })

  test('when not title', () => {
    try {
      new Bouquet({})
    } catch (error) {
      expect(error.message).toMatch(/title is required/)
      expect(error.stack).toMatch(error.message)
    }
  })

  test('when not description', ({ title }) => {
    try {
      new Bouquet({ title })
    } catch (error) {
      expect(error.message).toMatch(/description is required/)
      expect(error.stack).toMatch(error.message)
    }
  })

  test('when not tags', ({ title, description }) => {
    try {
      new Bouquet({ title, description })
    } catch (error) {
      expect(error.message).toMatch(/tags is required/)
      expect(error.stack).toMatch(error.message)
    }
  })

  test('when id', ({ id, title, description, tags }) => {
    const bouquet = new Bouquet({ id, title, description, tags })

    expect(bouquet.id).toEqual(id)
    expect(bouquet.persisted).toBe(true)
  })
})

describe('serialize', () => {
  test('when not persisted', ({ title, description, tags }) => {
    const bouquet = new Bouquet({ title, description, tags })

    const data = bouquet.serialize()

    expect(data.id).toBeUndefined()
    expect(data.name).toEqual(title)
    expect(data.description).toEqual(description)
    expect(data.tags).toStrictEqual(tags)
    expect(data.datasets).toStrictEqual([])
    expect(data.extras).toStrictEqual({})
    expect(data.private).toBe(true)
  })

  test('when persisted', ({ id, title, description, tags }) => {
    const bouquet = new Bouquet({ id, title, description, tags, draft: false })

    const data = bouquet.serialize()

    expect(data.id).toEqual(id)
    expect(data.private).toEqual(false)
  })

  describe('when nested entities and value objects', () => {
    beforeEach((context) => {
      const { id, title, description, tags } = context
      context.bouquet = new Bouquet({ id, title, description, tags })
    })

    test('when scope', ({ bouquet }) => {
      const theme = 'theme'
      const subTheme = 'sub-theme'
      bouquet.scope = new Scope({ theme, subTheme })

      const { extras: data } = bouquet.serialize()

      expect(data['scope:theme']).toEqual(theme)
    })

    test('when scope and one dataset properties', ({ bouquet }) => {
      const theme = 'theme'
      const subTheme = 'sub-theme'
      bouquet.scope = new Scope({ theme, subTheme })

      const title = 'title'
      const description = 'description'

      bouquet.datasets_properties = [
        new DatasetProperties({
          title,
          description,
          available: true
        })
      ]

      const { extras: data } = bouquet.serialize()
      const [datasetProperties] = data.datasets_properties

      expect(data['scope:theme']).toEqual(theme)
      expect(datasetProperties.title).toEqual(title)
    })

    test('when scope and many dataset properties', ({ bouquet }) => {
      const theme = 'theme'
      const subTheme = 'sub-theme'
      bouquet.scope = new Scope({ theme, subTheme })

      const title = 'title'
      const description = 'description'

      bouquet.datasets_properties = [
        new DatasetProperties({
          title,
          description,
          available: true
        }),
        new DatasetProperties({
          title: `${title} + 1`,
          description,
          available: true
        })
      ]

      const { extras: data } = bouquet.serialize()
      const datasetsProperties = data.datasets_properties

      expect(data['scope:theme']).toEqual(theme)
      expect(head(datasetsProperties).title).toEqual(title)
      expect(last(datasetsProperties).title).toEqual(`${title} + 1`)
    })

    test('when scope and many datasets and properties', ({ bouquet }) => {
      const theme = 'theme'
      const subTheme = 'sub-theme'
      bouquet.scope = new Scope({ theme, subTheme })

      const title = 'title'
      const description = 'description'

      bouquet.datasets_properties = [
        new DatasetProperties({
          title,
          description,
          available: true
        }),
        new DatasetProperties({
          title: `${title} + 1`,
          description,
          available: true
        })
      ]

      bouquet.datasets = [
        new Dataset({
          id: '1',
          title,
          description
        }),
        new Dataset({
          id: '2',
          title,
          description
        }),
        new Dataset({
          id: '3',
          title,
          description
        })
      ]

      const { datasets, extras: data } = bouquet.serialize()
      const datasetsProperties = data.datasets_properties

      expect(data['scope:theme']).toEqual(theme)
      expect(head(datasetsProperties).title).toEqual(title)
      expect(last(datasetsProperties).title).toEqual(`${title} + 1`)
      expect(head(datasets).id).toEqual('1')
      expect(last(datasets).id).toEqual('3')
    })
  })
})

describe('deserialize', () => {
  test('when not persisted', ({ title, description, tags }) => {
    const data = {
      name: title,
      description,
      tags
    }

    const bouquet = Bouquet.deserialize(data)

    expect(bouquet.id).toBeUndefined()
    expect(bouquet.title).toEqual(title)
    expect(bouquet.description).toEqual(description)
    expect(bouquet.tags).toStrictEqual(tags)
    expect(bouquet.scope).toBeNull()
    expect(bouquet.datasets_properties).toStrictEqual([])
    expect(bouquet.datasets).toStrictEqual([])
    expect(bouquet.draft).toBe(true)
    expect(bouquet.published).toBe(false)
    expect(bouquet.persisted).toBe(false)
  })

  test('when persisted', ({ id, title, description, tags }) => {
    const data = {
      id,
      name: title,
      description,
      tags,
      private: false
    }

    const bouquet = Bouquet.deserialize(data)

    expect(bouquet.id).toEqual(id)
    expect(bouquet.draft).toBe(false)
    expect(bouquet.published).toBe(true)
    expect(bouquet.persisted).toBe(true)
  })

  test('when scope', ({ id, title, description, tags }) => {
    const theme = 'theme'
    const subTheme = 'sub-theme'

    const data = {
      id,
      name: title,
      description,
      tags,
      extras: {
        'scope:theme': theme,
        'scope:sub-theme': subTheme
      }
    }

    const bouquet = Bouquet.deserialize(data)
    const { scope } = bouquet

    expect(bouquet.id).toEqual(id)
    expect(scope.theme).toBe(theme)
  })

  test('when scope and one dataset properties', ({
    id,
    title,
    description,
    tags
  }) => {
    const theme = 'theme'
    const subTheme = 'sub-theme'

    const data = {
      id,
      name: title,
      description,
      tags,
      extras: {
        'scope:theme': theme,
        'scope:sub-theme': subTheme,
        datasets_properties: [
          {
            title,
            description,
            available: true
          }
        ]
      }
    }

    const bouquet = Bouquet.deserialize(data)
    const { scope } = bouquet
    const [datasetProperties] = bouquet.datasets_properties

    expect(bouquet.id).toEqual(id)
    expect(scope.theme).toBe(theme)
    expect(datasetProperties.title).toEqual(title)
  })

  test('when scope and many dataset properties', ({
    id,
    title,
    description,
    tags
  }) => {
    const theme = 'theme'
    const subTheme = 'sub-theme'

    const data = {
      id,
      name: title,
      description,
      tags,
      extras: {
        'scope:theme': theme,
        'scope:sub-theme': subTheme,
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
          }
        ]
      }
    }

    const bouquet = Bouquet.deserialize(data)
    const { scope } = bouquet
    const datasetProperties = bouquet.datasets_properties

    expect(bouquet.id).toEqual(id)
    expect(scope.theme).toBe(theme)
    expect(head(datasetProperties).title).toEqual(title)
    expect(last(datasetProperties).title).toEqual(`${title} + 1`)
  })

  test('when scope and many dataset and properties', ({
    id,
    title,
    description,
    tags
  }) => {
    const theme = 'theme'
    const subTheme = 'sub-theme'

    const data = {
      id,
      name: title,
      description,
      tags,
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
      ],
      extras: {
        'scope:theme': theme,
        'scope:sub-theme': subTheme,
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
          }
        ]
      }
    }

    const bouquet = Bouquet.deserialize(data)
    const { datasets, scope } = bouquet
    const datasetProperties = bouquet.datasets_properties

    expect(bouquet.id).toEqual(id)
    expect(scope.theme).toBe(theme)
    expect(head(datasetProperties).title).toEqual(title)
    expect(last(datasetProperties).title).toEqual(`${title} + 1`)
    expect(head(datasets).id).toEqual('1')
    expect(last(datasets).id).toEqual('3')
  })

  test('when data KO', ({ id, title, description, tags }) => {
    const data = {
      id,
      name: title,
      description,
      tags,
      extras: {
        'scope:theme': 'theme'
      }
    }

    try {
      Bouquet.deserialize(data)
    } catch (error) {
      expect(error.message).toMatch(/subTheme is required/)
      expect(error.stack).toMatch(error.message)
    }
  })
})
