import { onMounted, ref } from 'vue'

// runs load on mount and exposes its loading and error state
export function useSectionLoader(load: () => Promise<void>) {
  const loading = ref(true)
  const error = ref(false)

  onMounted(async () => {
    try {
      await load()
    } catch (err) {
      console.error(err)
      error.value = true
    } finally {
      loading.value = false
    }
  })

  return { loading, error }
}
