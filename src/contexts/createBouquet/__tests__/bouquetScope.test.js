import { beforeEach, describe, expect, test } from 'vitest'

import BouquetScope from '@/contexts/createBouquet/bouquetScope'

beforeEach((context) => {
  context.theme = 'theme'
  context.subTheme = 'sub-theme'
})

test('serialize', ({ theme, subTheme }) => {
  const bouquetScope = new BouquetScope(theme, subTheme)

  const { extras: data } = bouquetScope.serialize()

  expect(data['scope:theme']).toEqual(theme)
  expect(data['scope:sub-theme']).toEqual(subTheme)
})

describe('deserialize', () => {
  test('when data OK', ({ theme, subTheme }) => {
    const data = {
      extras: {
        'scope:theme': theme,
        'scope:sub-theme': subTheme
      }
    }

    const bouquetScope = BouquetScope.deserialize(data)

    expect(bouquetScope.theme).toEqual(theme)
    expect(bouquetScope.subTheme).toEqual(subTheme)
  })

  test('when data KO', ({ theme }) => {
    const that = 'that'

    const data = {
      extras: {
        that,
        'scope:theme': theme
      }
    }

    try {
      BouquetScope.deserialize(data)
    } catch (error) {
      expect(error.message).toMatch(/subTheme is required/)
      expect(error.stack).toMatch(error.message)
    }
  })
})
