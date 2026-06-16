import { nextTick, onUnmounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'

interface UseHashScrollOptions {
  ready: () => boolean
  containerSelector: string
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
  let observer: ResizeObserver | null = null

  const scrollToElement = useDebounceFn((el: Element) => {
    if (!el.isConnected) return
    observer?.disconnect()
    observer = null
    el.scrollIntoView({ behavior: 'smooth' })
  }, debounceMs)

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  watchEffect(async () => {
    const hash = route.hash
    if (scrollHandled || !hash || !ready()) return
    const extraCondition = hashConditions?.[hash]
    if (extraCondition && !extraCondition()) return

    // Element already in DOM: scrollBehavior handles it, no need to intervene
    if (document.querySelector(hash)) return

    scrollHandled = true
    await nextTick()

    const el = document.querySelector(hash)
    if (!el) return

    observer = new ResizeObserver(() => scrollToElement(el))
    const container = document.querySelector(containerSelector)
    if (container) observer.observe(container)
    scrollToElement(el)
  })
}
