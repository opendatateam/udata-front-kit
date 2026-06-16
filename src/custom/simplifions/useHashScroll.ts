import { nextTick, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

interface UseHashScrollOptions {
  // base condition: is the page's primary data loaded?
  ready: () => boolean
  // CSS selector of the container to observe for layout stability
  containerSelector: string
  // per-hash extra conditions (for sections with conditional rendering)
  hashConditions?: Record<string, () => boolean>
  debounceMs?: number
}

export function useHashScroll({
  ready,
  containerSelector,
  hashConditions,
  debounceMs = 150
}: UseHashScrollOptions): void {
  const route = useRoute()
  let scrollHandled = false

  watchEffect(async () => {
    const hash = route.hash

    if (scrollHandled || !hash || !ready()) return

    const extraCondition = hashConditions?.[hash]
    if (extraCondition && !extraCondition()) return

    scrollHandled = true
    await nextTick()
    scrollToStable(hash, containerSelector, debounceMs)
  })
}

// Waits for the container to stop resizing (debounced) before scrolling.
// This handles async child components that expand after the initial render.
function scrollToStable(
  hash: string,
  containerSelector: string,
  debounceMs: number
) {
  const el = document.querySelector(hash)
  if (!el) return

  let timer: ReturnType<typeof setTimeout>
  const scheduleScroll = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      observer.disconnect()
      el.scrollIntoView({ behavior: 'smooth' })
    }, debounceMs)
  }

  const observer = new ResizeObserver(scheduleScroll)
  const container = document.querySelector(containerSelector)
  if (container) observer.observe(container)

  scheduleScroll()
  setTimeout(() => observer.disconnect(), 3000)
}
