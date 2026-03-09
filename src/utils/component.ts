import type { Component, ComputedRef } from 'vue'
import { computed, defineAsyncComponent } from 'vue'

interface UseAsyncComponentOptions<T extends Component | null = null> {
  fallback?: T
  loadingComponent?: Component
}

/**
 * Creates a computed property that loads a component asynchronously from a loader function.
 *
 * @param loader - A function that returns a component loader (e.g., from router meta)
 * @param options - Optional configuration object
 * @param options.fallback - An optional fallback component or null if no component should be rendered (defaults to null)
 * @param options.loadingComponent - An optional component to show while loading
 * @returns A computed ref containing the async component or the fallback
 *
 * @example
 * // Load component from router meta with fallback
 * const CardComponent = useAsyncComponent(
 *   () => meta?.cardComponent,
 *   { fallback: DatasetCard }
 * )
 *
 * @example
 * // Load component from router meta with loading component
 * const ListComponent = useAsyncComponent(
 *   () => meta?.listComponent,
 *   { loadingComponent: ContentPlaceholder }
 * )
 */
export function useAsyncComponent<T extends Component | null = null>(
  loader: () => (() => Promise<Component>) | undefined,
  options: UseAsyncComponentOptions<T> = {}
): ComputedRef<ReturnType<typeof defineAsyncComponent> | T> {
  const { fallback = null as T, loadingComponent } = options
  return computed(() => {
    const componentLoader = loader()
    if (componentLoader) {
      return defineAsyncComponent({
        loader: componentLoader,
        loadingComponent,
        onError: (err) => {
          console.error('Failed to load component:', err)
        }
      })
    }
    return fallback as T
  })
}
