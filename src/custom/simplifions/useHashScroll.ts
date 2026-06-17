import { onUnmounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

interface UseHashScrollOptions {
  ready: () => boolean
  hashConditions?: Record<string, () => boolean>
  debounceMs?: number
}

export function useHashScroll({
  ready,
  hashConditions,
  debounceMs = 150
}: UseHashScrollOptions): void {
  const route = useRoute()
  let scrollHandledFor: string | null = null
  let observer: MutationObserver | null = null
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null

  const cleanup = () => {
    observer?.disconnect()
    observer = null
    if (scrollTimeout !== null) {
      clearTimeout(scrollTimeout)
      scrollTimeout = null
    }
  }

  onUnmounted(cleanup)

  watchEffect(() => {
    const hash = route.hash
    if (scrollHandledFor === hash || !hash || !ready()) return
    const extraCondition = hashConditions?.[hash]
    if (extraCondition && !extraCondition()) return

    // Element already in DOM: scrollBehavior handles it
    if (document.querySelector(hash)) {
      cleanup()
      return
    }

    cleanup()

    observer = new MutationObserver(() => {
      const el = document.querySelector(hash)
      if (!el) return
      // Debounce: wait for DOM mutations to settle before scrolling,
      // so content above the target (async sections) has finished rendering.
      if (scrollTimeout !== null) clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null
        if (!el.isConnected) return
        el.scrollIntoView({ behavior: 'smooth' })
        scrollHandledFor = hash
        cleanup()
      }, debounceMs)
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })
}
