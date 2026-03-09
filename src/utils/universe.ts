import { usePageConf } from './config'

// Params that can have multiple values - everything else will trigger a warning
const MULTIPLE_VALUE_PARAMS = ['tag']

export const useUniverseQuery = (
  pageKey: string,
  apiParams: Record<string, string[]>
) => {
  const pageConf = usePageConf(pageKey)
  const universeQuery = pageConf.universe_query || {}

  // Merge universe query with apiParams
  const mergedParams: Record<string, string[]> = { ...apiParams }

  for (const [key, value] of Object.entries(universeQuery)) {
    if (!mergedParams[key]) {
      mergedParams[key] = []
    }
    mergedParams[key].push(String(value))
  }

  // Check for params that shouldn't have multiple values
  for (const [param, values] of Object.entries(mergedParams)) {
    if (!MULTIPLE_VALUE_PARAMS.includes(param) && values.length > 1) {
      console.warn(
        `Multiple values found for '${param}' parameter: ${values.join(', ')}. This may cause unexpected behavior.`
      )
    }
  }

  return mergedParams
}
