import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

export function useCarouselScroll(itemSelector: string, onResize?: () => void) {
  const track = ref<HTMLElement | null>(null)
  const scrollLeft = ref(0)
  const scrollMax = ref(0)

  const hasOverflow = computed(() => scrollMax.value > 0)
  const canPrev = computed(() => scrollLeft.value > 4)
  const canNext = computed(() => scrollLeft.value < scrollMax.value - 4)

  const updateScrollState = () => {
    if (!track.value) return
    scrollMax.value = track.value.scrollWidth - track.value.clientWidth
    scrollLeft.value = track.value.scrollLeft
  }

  const onScroll = () => {
    if (!track.value) return
    scrollLeft.value = track.value.scrollLeft
  }

  const itemWidth = () => {
    const item = track.value?.querySelector(itemSelector) as HTMLElement | null
    return item ? item.offsetWidth + 16 : 300
  }

  const prev = () => track.value?.scrollBy({ left: -itemWidth(), behavior: 'smooth' })
  const next = () => track.value?.scrollBy({ left: itemWidth(), behavior: 'smooth' })

  const ro = new ResizeObserver(() => {
    updateScrollState()
    onResize?.()
  })

  onMounted(async () => {
    if (!track.value) return
    await nextTick()
    updateScrollState()
    ro.observe(track.value)
  })

  onUnmounted(() => ro.disconnect())

  return { track, hasOverflow, canPrev, canNext, onScroll, prev, next, updateScrollState }
}
