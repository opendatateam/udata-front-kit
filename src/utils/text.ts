import { camelCase } from 'lodash/fp'

import type { CamelCase } from '@/model/text'

/**
 * Transform object keys to camelCase.
 */
function toCamel<T extends object>(obj: T): CamelCase<T>
function toCamel<T extends object>(obj: T[]): Array<CamelCase<T>>
function toCamel<T extends object>(
  obj: T | T[]
): CamelCase<T> | Array<CamelCase<T>> {
  if (Array.isArray(obj)) {
    return obj.map((item: T) => toCamel(item))
  }

  const entries: Array<[string, unknown]> = Object.entries(obj)

  const transformedEntries: Array<[keyof CamelCase<T>, unknown]> = entries.map(
    ([key, value]) => {
      const camelKey: keyof CamelCase<T> = camelCase(key) as keyof CamelCase<T>

      const transformedValue =
        typeof value === 'object' && value !== null
          ? toCamel(value as T)
          : value

      return [camelKey, transformedValue]
    }
  )

  return Object.fromEntries(transformedEntries) as CamelCase<T>
}

export { toCamel }
