export interface ConfigDiffEntry {
  path: string
  before: unknown
  after: unknown
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// Arrays and primitives are compared as leaves (via JSON equality) rather
// than diffed index-by-index — good enough for a debug view, and avoids
// noisy per-item entries for things like tags/links arrays.
export function diffConfig(
  base: unknown,
  current: unknown,
  path = ''
): ConfigDiffEntry[] {
  if (isPlainObject(base) && isPlainObject(current)) {
    const keys = new Set([...Object.keys(base), ...Object.keys(current)])
    const entries: ConfigDiffEntry[] = []
    for (const key of keys) {
      entries.push(
        ...diffConfig(base[key], current[key], path ? `${path}.${key}` : key)
      )
    }
    return entries
  }
  if (JSON.stringify(base) === JSON.stringify(current)) return []
  return [{ path, before: base, after: current }]
}
