import { beforeEach, describe, expect, test } from 'vitest'

import Scope from '@/contexts/createBouquet/scope'

beforeEach((context) => {
  context.theme = 'theme'
  context.subTheme = 'sub-theme'
})

test('serialize', ({ theme, subTheme }) => {
  const scope = new Scope({ theme, subTheme })

  const { extras: data } = scope.serialize()

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

    const scope = Scope.deserialize(data)

    expect(scope.theme).toEqual(theme)
    expect(scope.subTheme).toEqual(subTheme)
  })

  test('when data KO', ({ theme }) => {
    const data = {
      extras: {
        that: 'that',
        'scope:theme': theme
      }
    }

    try {
      Scope.deserialize(data)
    } catch (error) {
      expect(error.message).toMatch(/subTheme is required/)
      expect(error.stack).toMatch(error.message)
    }
  })
})
