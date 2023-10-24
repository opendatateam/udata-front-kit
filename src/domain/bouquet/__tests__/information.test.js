import { beforeEach, describe, expect, test } from 'vitest'

import Information from '@/domain/bouquet/information'

beforeEach((context) => {
  context.theme = 'theme'
  context.subTheme = 'sub-theme'
})

test('serialize', ({ theme, subTheme }) => {
  const information = new Information(theme, subTheme)

  const { extras } = information.serialize()

  expect(extras['information:theme']).toEqual(theme)
  expect(extras['information:sub-theme']).toEqual(subTheme)
})

describe('deserialize', () => {
  test('when params OK', ({ theme, subTheme }) => {
    const params = {
      extras: {
        'information:theme': theme,
        'information:sub-theme': subTheme
      }
    }

    const information = Information.deserialize(params)

    expect(information.theme).toEqual(theme)
    expect(information.subTheme).toEqual(subTheme)
  })

  test('when params KO', ({ theme }) => {
    const that = 'that'

    const params = {
      extras: {
        that,
        'information:theme': theme
      }
    }

    const information = Information.deserialize(params)

    expect(information.that).toBeUndefined()
    expect(information.theme).toEqual(theme)
    expect(information.subTheme).toBeNull()
  })
})
