import type { IndicatorResource } from '@/custom/ecospheres/model/indicator'
import { describe, expect, it } from 'vitest'
import { formatBigNumber, formatData } from '../format'

describe('formatBigNumber', () => {
  it('returns the plain number when max < 1000', () => {
    expect(formatBigNumber(500, 999)).toBe('500')
  })

  it('uses k suffix for thousands', () => {
    expect(formatBigNumber(2000, 2000)).toBe('2k')
  })

  it('uses M suffix for millions', () => {
    expect(formatBigNumber(3_000_000, 3_000_000)).toBe('3M')
  })

  it('uses Md suffix for billions', () => {
    expect(formatBigNumber(4_000_000_000, 4_000_000_000)).toBe('4Md')
  })

  it('appends the correct suffix for float values', () => {
    expect(formatBigNumber(1_500_000, 2_000_000)).toMatch(/1[.,]5M$/)
    expect(formatBigNumber(1_500_000_000, 2_000_000_000)).toMatch(/1[.,]5Md$/)
  })
})

describe('formatData', () => {
  const resource = {
    id: 'test-resource',
    extras: {
      'ecospheres-indicateurs': {
        maille: 'region' as const,
        'value-column': 'valeur',
        axes: {}
      }
    }
  } as unknown as IndicatorResource

  it('returns an empty array for empty input', () => {
    expect(formatData([], resource)).toEqual([])
  })

  it('extracts year from date_mesure and maps the value column', () => {
    const raw = [{ date_mesure: '2021-06-15', valeur: 42 }]
    const result = formatData(raw, resource)
    expect(result).toEqual([{ year: 2021, value: 42 }])
  })

  it('maps axis columns onto each row', () => {
    const resourceWithAxes = {
      id: 'test-resource',
      extras: {
        'ecospheres-indicateurs': {
          maille: 'region' as const,
          'value-column': 'valeur',
          axes: { secteur: ['transport', 'energie'] }
        }
      }
    } as unknown as IndicatorResource

    const raw = [
      { date_mesure: '2020-01-01', valeur: 100, secteur: 'transport' },
      { date_mesure: '2021-01-01', valeur: 150, secteur: 'energie' }
    ]
    const result = formatData(raw, resourceWithAxes)
    expect(result[0]).toMatchObject({
      year: 2020,
      value: 100,
      secteur: 'transport'
    })
    expect(result[1]).toMatchObject({
      year: 2021,
      value: 150,
      secteur: 'energie'
    })
  })

  it('rounds values >= 10 to integers', () => {
    const raw = [{ date_mesure: '2020-01-01', valeur: 12.7 }]
    const result = formatData(raw, resource)
    expect(result[0].value).toBe(13)
  })

  it('keeps 2 decimal places for values < 10', () => {
    const raw = [{ date_mesure: '2020-01-01', valeur: 1.234 }]
    const result = formatData(raw, resource)
    expect(result[0].value).toBe(1.23)
  })
})
