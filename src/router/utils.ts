import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router'

interface RouteLocationParamsAsString
  extends Omit<RouteLocationNormalizedLoaded, 'params'> {
  params: Record<string, string>
}

/**
 * Exposes first element from route params that could contain an array
 * Warning: this will discard the other values if any
 */
export const useRouteParamsAsString = (): RouteLocationParamsAsString => {
  const route = useRoute()
  const params = Object.fromEntries(
    Object.entries(route.params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value
    ])
  )
  return { ...route, params }
}
