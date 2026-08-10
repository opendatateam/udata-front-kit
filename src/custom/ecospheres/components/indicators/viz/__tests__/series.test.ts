import { describe, expect, it } from 'vitest'
import { makeSeries } from '../series'

describe('makeSeries', () => {
  describe('no axes', () => {
    it('returns a single unnamed series with one point per row', () => {
      const rows = [
        { year: 2020, value: 100 },
        { year: 2021, value: 150 }
      ]
      const result = makeSeries(rows, [], {}, {})
      expect(result).toHaveLength(1)
      expect(result[0].label).toBe('')
      expect(result[0].data).toEqual([
        { x: 2020, y: 100 },
        { x: 2021, y: 150 }
      ])
    })
  })

  describe('one axis, not grouped', () => {
    it('splits into one series per axis value', () => {
      const rows = [
        { year: 2020, value: 100, secteur: 'transport' },
        { year: 2020, value: 200, secteur: 'energie' },
        { year: 2021, value: 120, secteur: 'transport' }
      ]
      const result = makeSeries(
        rows,
        ['secteur'],
        { secteur: ['transport', 'energie'] },
        { secteur: false }
      )
      expect(result).toHaveLength(2)

      const transport = result.find((s) => s.label === 'transport')!
      expect(transport.data).toEqual([
        { x: 2020, y: 100 },
        { x: 2021, y: 120 }
      ])

      const energie = result.find((s) => s.label === 'energie')!
      expect(energie.data).toEqual([{ x: 2020, y: 200 }])
    })

    it('excludes rows not present in the axis filter', () => {
      const rows = [
        { year: 2020, value: 100, secteur: 'transport' },
        { year: 2020, value: 200, secteur: 'energie' }
      ]
      const result = makeSeries(
        rows,
        ['secteur'],
        { secteur: ['transport'] },
        { secteur: false }
      )
      expect(result).toHaveLength(1)
      expect(result[0].label).toBe('transport')
    })
  })

  describe('one axis, grouped', () => {
    it('sums values by year into a single Total series', () => {
      const rows = [
        { year: 2020, value: 100, secteur: 'transport' },
        { year: 2020, value: 200, secteur: 'energie' },
        { year: 2021, value: 120, secteur: 'transport' },
        { year: 2021, value: 180, secteur: 'energie' }
      ]
      const result = makeSeries(
        rows,
        ['secteur'],
        { secteur: ['transport', 'energie'] },
        { secteur: true }
      )
      expect(result).toHaveLength(1)
      expect(result[0].label).toBe('Total')
      expect(result[0].data).toEqual(
        expect.arrayContaining([
          { x: 2020, y: 300 },
          { x: 2021, y: 300 }
        ])
      )
    })
  })

  describe('two axes', () => {
    it('uses non-grouped axes as the series label, separated by " - "', () => {
      const rows = [
        { year: 2020, value: 100, secteur: 'transport', region: 'idf' },
        { year: 2020, value: 200, secteur: 'energie', region: 'idf' }
      ]
      const result = makeSeries(
        rows,
        ['secteur', 'region'],
        { secteur: ['transport', 'energie'], region: ['idf'] },
        { secteur: false, region: false }
      )
      expect(result).toHaveLength(2)
      expect(result.map((s) => s.label)).toEqual(
        expect.arrayContaining(['transport - idf', 'energie - idf'])
      )
    })
  })
})
