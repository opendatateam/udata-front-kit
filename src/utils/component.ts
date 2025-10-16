import type { Component, ComputedRef } from 'vue'
import { computed, defineAsyncComponent } from 'vue'

/**
 * Creates a computed property that loads a component asynchronously from a loader function.
 *
 * @param loader - A function that returns a component loader (e.g., from router meta)
 * @param fallback - An optional fallback component or null if no component should be rendered (defaults to null)
 * @returns A computed ref containing the async component or the fallback
 *
 * @example
 * // Load component from router meta with fallback
 * const CardComponent = useAsyncComponent(
 *   () => meta?.cardComponent,
 *   DatasetCard
 * )
 *
 * @example
 * // Load component from router meta without fallback
 * const ListComponent = useAsyncComponent(() => meta?.listComponent)
 */
export function useAsyncComponent<T extends Component | null = null>(
  loader: () => (() => Promise<Component>) | undefined,
  fallback: T = null as T
): ComputedRef<ReturnType<typeof defineAsyncComponent> | T> {
  return computed(() => {
    const componentLoader = loader()
    if (componentLoader) {
      return defineAsyncComponent({
        loader: componentLoader,
        onError: (err) => {
          console.error('Failed to load component:', err)
        }
      })
    }
    return fallback as T
  })
}
